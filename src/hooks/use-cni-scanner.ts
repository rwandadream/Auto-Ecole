'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  canvasFromFile,
  captureVideoFrame,
  hasUsefulCniData,
  parseCniText,
  preprocessCniCanvas,
  type CniScanResult,
} from '@/lib/cni-ocr'

export type { CniScanResult } from '@/lib/cni-ocr'

export type ScannerStatus = 'idle' | 'camera' | 'processing' | 'done' | 'error'

type TesseractWorker = {
  recognize: (image: HTMLCanvasElement) => Promise<{ data: { text: string } }>
  terminate: () => Promise<void>
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
      setProgress('Chargement du moteur OCR…')
      const { createWorker } = await import('tesseract.js')
      const w = await createWorker('fra', 1, {
        logger: (message) => {
          if (message.status === 'loading language traineddata') {
            setProgress('Téléchargement du modèle français…')
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
    })()

    return workerPromiseRef.current
  }, [])

  const runOcr = useCallback(
    async (source: HTMLCanvasElement): Promise<CniScanResult> => {
      setStatus('processing')
      setError(null)

      try {
        const processed = preprocessCniCanvas(source)
        setPreview(processed)
        const worker = await ensureWorker()
        if (!worker) throw new Error('Worker unavailable')
        const { data } = await worker.recognize(processed)
        const parsed = parseCniText(data.text)
        setStatus('done')
        setProgress(null)
        return parsed
      } catch {
        setError('OCR échoué — complétez la saisie manuellement.')
        setStatus('error')
        setProgress(null)
        return {
          nom: '',
          prenom: '',
          dateNaissance: '',
          numPiece: '',
          lieuNaissance: '',
          sexe: '',
          nationalite: '',
        }
      }
    },
    [ensureWorker, setPreview],
  )

  const startCamera = useCallback(async () => {
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
      void ensureWorker()
    } catch {
      setError('Impossible d\'accéder à la webcam. Importez une photo ou saisissez les champs manuellement.')
      setStatus('error')
    }
  }, [ensureWorker, stopCamera])

  const captureAndScan = useCallback(async (): Promise<CniScanResult> => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      setError('Activez la caméra avant de scanner.')
      setStatus('error')
      return {
        nom: '',
        prenom: '',
        dateNaissance: '',
        numPiece: '',
        lieuNaissance: '',
        sexe: '',
        nationalite: '',
      }
    }

    return runOcr(captureVideoFrame(video))
  }, [runOcr])

  const scanFromFile = useCallback(
    async (file: File): Promise<CniScanResult> => {
      if (!file.type.startsWith('image/')) {
        setError('Choisissez une image (JPG, PNG, WEBP).')
        setStatus('error')
        return {
          nom: '',
          prenom: '',
          dateNaissance: '',
          numPiece: '',
          lieuNaissance: '',
          sexe: '',
          nationalite: '',
        }
      }

      try {
        const canvas = await canvasFromFile(file)
        return runOcr(canvas)
      } catch {
        setError('Impossible de lire cette image.')
        setStatus('error')
        return {
          nom: '',
          prenom: '',
          dateNaissance: '',
          numPiece: '',
          lieuNaissance: '',
          sexe: '',
          nationalite: '',
        }
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
