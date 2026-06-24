'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { BrandLogo } from '@/components/dashboard/brand-logo'
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Hash,
  Phone,
  LogIn,
  Loader2,
  AlertCircle,
  User,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type TabKey = 'admin' | 'eleve'

function LoginField({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  suffix,
}: {
  id: string
  label: string
  icon: ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete?: string
  disabled?: boolean
  suffix?: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-foreground/90">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-border/80 bg-background/80 pl-10 pr-10 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/60 hover:border-border focus:border-primary focus:bg-background focus:outline-none focus:ring-[3px] focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  )
}


const ROLES: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: 'admin', label: 'Administration', icon: User },
  { key: 'eleve', label: 'Portail élève', icon: GraduationCap },
]

export function LoginView() {
  const loginAdmin = useAuthStore((s) => s.loginAdmin)
  const loginEleve = useAuthStore((s) => s.loginEleve)

  const [activeTab, setActiveTab] = useState<TabKey>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [telephone, setTelephone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const resetError = () => error && setError('')

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab)
    setError('')
    setLoading(false)
    setForgotMode(false)
    setResetSent(false)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Adresse email invalide.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setResetSent(true)
      toast.success('Email de réinitialisation envoyé.')
    } catch {
      setError('Impossible d\'envoyer l\'email de réinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.')
      return
    }
    if (!email.includes('@')) {
      setError('Adresse email invalide.')
      return
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe.')
      return
    }

    setLoading(true)
    const ok = await loginAdmin(email.trim(), password)
    if (!ok) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    }
  }

  const handleEleveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Veuillez saisir votre code dossier.')
      return
    }
    if (!telephone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone.')
      return
    }

    setLoading(true)
    const ok = await loginEleve(code.trim(), telephone.trim())
    if (!ok) {
      setError('Code dossier ou téléphone incorrect.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full overflow-hidden">
      {/* Fond plein écran */}
      <Image
        src="/trafic.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <div className="login-vignette fixed inset-0" aria-hidden />

      {/* Contenu centré */}
      <div className="relative z-10 flex min-h-screen min-h-[100dvh] w-full items-center justify-center p-4 sm:p-6">
        <div className="login-card-enter w-full max-w-[420px]">
          <div className="overflow-hidden rounded-[1.35rem] border border-white/25 bg-white/90 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            {/* Bandeau brand */}
            <div className="relative border-b border-border/50 bg-gradient-to-r from-primary/8 via-transparent to-primary/5 px-6 py-7">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-3 shadow-md ring-1 ring-border/30">
                  <BrandLogo size="lg" className="h-full w-full rounded-lg" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-foreground">
                    SARAH AUTO
                  </h1>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    ERP Auto-École · Cocody
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-7 sm:py-6">
              {/* Sélecteur de rôle */}
              <div
                role="tablist"
                aria-label="Type de connexion"
                className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/50 p-1"
              >
                {ROLES.map(({ key, label, icon: Icon }) => {
                  const active = activeTab === key
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => switchTab(key)}
                      className={cn(
                        'flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all duration-200 sm:text-[13px]',
                        active
                          ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Erreur */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Formulaire Admin */}
              {activeTab === 'admin' && (
                <div role="tabpanel">
                  {forgotMode ? (
                    <>
                      <div className="mb-4">
                        <h2 className="text-[15px] font-semibold text-foreground">
                          Mot de passe oublié
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Un lien de réinitialisation sera envoyé à votre email staff.
                        </p>
                      </div>
                      {resetSent ? (
                        <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-3 text-sm text-success">
                          Si un compte existe pour <strong>{email}</strong>, vous recevrez un email avec un lien
                          valide quelques minutes.
                        </p>
                      ) : (
                        <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                          <LoginField
                            id="reset-email"
                            label="Adresse email"
                            icon={<Mail className="h-4 w-4" />}
                            type="email"
                            autoComplete="email"
                            disabled={loading}
                            value={email}
                            onChange={(v) => {
                              setEmail(v)
                              resetError()
                            }}
                            placeholder="vous@sarahauto.ci"
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Envoyer le lien
                          </button>
                        </form>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode(false)
                          setResetSent(false)
                          setError('')
                        }}
                        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Retour à la connexion
                      </button>
                    </>
                  ) : (
                    <>
                  <div className="mb-4">
                    <h2 className="text-[15px] font-semibold text-foreground">
                      Connexion équipe
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Accès réservé au personnel SARAH AUTO
                    </p>
                  </div>

                  <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                    <LoginField
                      id="email"
                      label="Adresse email"
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                      autoComplete="email"
                      disabled={loading}
                      value={email}
                      onChange={(v) => {
                        setEmail(v)
                        resetError()
                      }}
                      placeholder="vous@sarahauto.ci"
                    />

                    <LoginField
                      id="password"
                      label="Mot de passe"
                      icon={<Lock className="h-4 w-4" />}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      disabled={loading}
                      value={password}
                      onChange={(v) => {
                        setPassword(v)
                        resetError()
                      }}
                      placeholder="••••••••"
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={
                            showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                          }
                          className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode(true)
                          setError('')
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connexion en cours…
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          Se connecter
                        </>
                      )}
                    </button>
                  </form>
                    </>
                  )}
                </div>
              )}

              {/* Formulaire Élève */}
              {activeTab === 'eleve' && (
                <div role="tabpanel">
                  <div className="mb-4">
                    <h2 className="text-[15px] font-semibold text-foreground">
                      Espace apprenant
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Suivez votre formation et votre planning
                    </p>
                  </div>

                  <form onSubmit={handleEleveSubmit} className="space-y-3.5">
                    <LoginField
                      id="code"
                      label="Code dossier"
                      icon={<Hash className="h-4 w-4" />}
                      disabled={loading}
                      value={code}
                      onChange={(v) => {
                        setCode(v)
                        resetError()
                      }}
                      placeholder="EL-XXXX"
                    />

                    <LoginField
                      id="telephone"
                      label="Numéro de téléphone"
                      icon={<Phone className="h-4 w-4" />}
                      type="tel"
                      autoComplete="tel"
                      disabled={loading}
                      value={telephone}
                      onChange={(v) => {
                        setTelephone(v)
                        resetError()
                      }}
                      placeholder="+225 07 12 34 56"
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connexion en cours…
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          Accéder à mon espace
                        </>
                      )}
                    </button>
                  </form>

                </div>
              )}

              {/* Footer confiance */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80">
                <ShieldCheck className="h-3 w-3 text-primary/70" />
                Connexion sécurisée · Données chiffrées localement
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-white/70 drop-shadow-sm">
            © {new Date().getFullYear()} SARAH AUTO — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}
