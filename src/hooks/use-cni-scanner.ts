'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  canvasFromFile,
  captureVideoFrame,
  hasUsefulCniData,
  parseIdentityDocumentText,
  preprocessCniCanvas,
  type CniScanResult,
} from '@/lib/cni-ocr'

export type { CniScanResult } from '@/lib/cni-ocr'

export type ScannerStatus = 'idle' | 'camera' | 'processing' | 'done' | 'error'

type TesseractWorker = {
  recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string } }>
  terminate: () => Promise<void>
}

const EMPTY_RESULT: CniScanResult = {
  nom: '',
  prenom: '',
  dateNaissance: '',
  numPiece: '',
  lieuNaissance: '',
  sexe: '',
  nationalite: '',
  typePiece: '',
}

async function openCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
    { video: true, audio: false },
  ]

  let lastError: unknown
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Caméra inaccessible')
}

export function useCniScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<TesseractWorker | null>(null)
  const workerPromiseRef = useRef<Promise<TesseractWorker> | null>(null)

  const [status, setStatus] = useState<ScannerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const setPreview = useCallback((canvas: HTMLCanvasElement | null) => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      if (!canvas) return null
      return canvas.toDataURL('image/jpeg', 0.85)
    })
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setStatus((current) => (current === 'camera' || current === 'done' ? 'idle' : current))
  }, [])

  const ensureWorker = useCallback(async () => {
    if (workerRef.current) return workerRef.current
    if (workerPromiseRef.current) return workerPromiseRef.current

    workerPromiseRef.current = (async () => {
      try {
        setProgress('Chargement du moteur OCR…')
        const { createWorker } = await import('tesseract.js')
        const w = await createWorker('fra', 1, {
          workerPath: '/tess/worker.min.js',
          corePath: '/tess',
          langPath: '/tess',
          workerBlobURL: false,
          logger: (message) => {
            if (message.status === 'loading language traineddata') {
              setProgress('Chargement du modèle français…')
            }
            if (message.status === 'initializing tesseract') {
              setProgress('Initialisation OCR…')
            }
            if (message.status === 'recognizing text') {
              setProgress(`Analyse OCR ${Math.round((message.progress ?? 0) * 100)}%`)
            }
          },
        })
        const worker = w as unknown as TesseractWorker
        workerRef.current = worker
        setProgress(null)
        return worker
      } catch (err) {
        workerPromiseRef.current = null
        workerRef.current = null
        console.error('[OCR] createWorker failed', err)
        throw err
      }
    })()

    return workerPromiseRef.current
  }, [])

  const runOcr = useCallback(
    async (source: HTMLCanvasElement): Promise<CniScanResult> => {
      setStatus('processing')
      setError(null)

      try {
        const worker = await ensureWorker()
        if (!worker) throw new Error('WORKER_UNAVAILABLE')

        const processed = preprocessCniCanvas(source)
        setPreview(processed)

        let { data } = await worker.recognize(processed)
        let parsed = parseIdentityDocumentText(data.text)

        // Fallback : image brute si le prétraitement a trop dégradé le texte
        if (!hasUsefulCniData(parsed) && (!data.text || data.text.trim().length < 12)) {
          setProgress('Nouvelle passe OCR (image brute)…')
          setPreview(source)
          ;({ data } = await worker.recognize(source))
          parsed = parseIdentityDocumentText(data.text)
        } else if (!hasUsefulCniData(parsed)) {
          setProgress('Nouvelle passe OCR (image brute)…')
          setPreview(source)
          ;({ data } = await worker.recognize(source))
          const retry = parseIdentityDocumentText(data.text)
          if (hasUsefulCniData(retry)) parsed = retry
        }

        setStatus('done')
        setProgress(null)
        return parsed
      } catch (err) {
        console.error('[OCR] runOcr failed', err)
        workerPromiseRef.current = null
        const isWorker =
          err instanceof Error &&
          (err.message === 'WORKER_UNAVAILABLE' ||
            /worker|fetch|network|traineddata|wasm|Failed to fetch/i.test(err.message))
        setError(
          isWorker
            ? 'Moteur OCR inaccessible — réessayez ou saisissez manuellement.'
            : 'OCR échoué — complétez la saisie manuellement.',
        )
        setStatus('error')
        setProgress(null)
        return { ...EMPTY_RESULT }
      }
    },
    [ensureWorker, setPreview],
  )

  const startCamera = useCallback(async () => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError(
        'La caméra nécessite HTTPS (ou localhost). Utilisez « Importer une photo » ou saisissez manuellement.',
      )
      setStatus('error')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Webcam non supportée sur cet appareil. Importez une photo ou saisissez manuellement.')
      setStatus('error')
      return
    }

    setError(null)
    setProgress(null)

    try {
      stopCamera()
      const stream = await openCameraStream()
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('camera')
      void ensureWorker().catch(() => {})
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError(
          'Permission caméra refusée. Autorisez l\'accès dans le navigateur, ou importez une photo de la CNI.',
        )
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('Aucune caméra détectée. Importez une photo de la CNI.')
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setError('Caméra déjà utilisée par une autre application. Fermez-la puis réessayez, ou importez une photo.')
      } else {
        setError('Impossible d\'accéder à la webcam. Importez une photo ou saisissez les champs manuellement.')
      }
      setStatus('error')
    }
  }, [ensureWorker, stopCamera])

  const captureAndScan = useCallback(async (): Promise<CniScanResult> => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      setError('Activez la caméra avant de scanner.')
      setStatus('error')
      return { ...EMPTY_RESULT }
    }

    return runOcr(captureVideoFrame(video))
  }, [runOcr])

  const scanFromFile = useCallback(
    async (file: File): Promise<CniScanResult> => {
      if (!file.type.startsWith('image/')) {
        setError('Choisissez une image (JPG, PNG, WEBP).')
        setStatus('error')
        return { ...EMPTY_RESULT }
      }

      try {
        const canvas = await canvasFromFile(file)
        return runOcr(canvas)
      } catch {
        setError('Impossible de lire cette image.')
        setStatus('error')
        return { ...EMPTY_RESULT }
      }
    },
    [runOcr],
  )

  useEffect(() => {
    return () => {
      stopCamera()
      setPreview(null)
      void workerRef.current?.terminate()
      workerRef.current = null
      workerPromiseRef.current = null
    }
  }, [setPreview, stopCamera])

  return {
    videoRef,
    status,
    error,
    progress,
    previewUrl,
    hasUsefulCniData,
    startCamera,
    stopCamera,
    captureAndScan,
    scanFromFile,
  }
}
