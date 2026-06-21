'use client'

import { useState } from 'react'
import {
  GraduationCap,
  CheckCircle2,
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
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'

type TabKey = 'admin' | 'eleve'

export function LoginView() {
  const { loginAdmin, loginEleve } = useAuthStore()

  const [activeTab, setActiveTab] = useState<TabKey>('admin')

  // Admin form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Eleve form state
  const [code, setCode] = useState('')
  const [telephone, setTelephone] = useState('')

  // Shared state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetError = () => error && setError('')

  const handleAdminSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const ok = loginAdmin(email.trim(), password)
      if (!ok) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
      }
    }, 600)
  }

  const handleEleveSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const ok = loginEleve(code.trim(), telephone.trim())
      if (!ok) {
        setError('Code dossier ou téléphone incorrect.')
        setLoading(false)
      }
    }, 600)
  }

  const switchTab = (tab: string) => {
    setActiveTab(tab as TabKey)
    setError('')
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* ============== BACKGROUND IMAGE ============== */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.png')" }}
        aria-hidden="true"
      />
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-black/80"
        aria-hidden="true"
      />
      {/* Subtle orange glow accent */}
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      {/* ============== CENTERED LOGIN CARD ============== */}
      <div className="relative z-10 flex w-full max-w-md flex-col px-4 py-8 sm:px-6">
        {/* Brand header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/30 ring-1 ring-white/20">
            <GraduationCap className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            SARAH AUTO
          </h1>
          <p className="mt-0.5 text-sm font-medium uppercase tracking-wider text-white/70">
            ERP Auto-École
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <Tabs value={activeTab} onValueChange={switchTab} className="w-full">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
              <TabsTrigger
                value="admin"
                className="h-9 rounded-md text-sm font-medium text-white/70 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <User className="h-4 w-4" />
                Administration
              </TabsTrigger>
              <TabsTrigger
                value="eleve"
                className="h-9 rounded-md text-sm font-medium text-white/70 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                <GraduationCap className="h-4 w-4" />
                Portail Élève
              </TabsTrigger>
            </TabsList>

            {/* Error banner (shared) */}
            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-rose-300/30 bg-rose-500/15 p-3 text-sm text-rose-100 backdrop-blur-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* ============== TAB ADMIN ============== */}
            <TabsContent value="admin" className="mt-6">
              <div className="mb-5 space-y-1">
                <h2 className="text-lg font-bold text-white">Connexion Administration</h2>
                <p className="text-sm text-white/60">Email et mot de passe</p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-white/90">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        resetError()
                      }}
                      placeholder="vous@sarahauto.ci"
                      className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-primary focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-white/90">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        resetError()
                      }}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-10 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-primary focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              {/* Hint box */}
              <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/60 backdrop-blur-sm">
                <p className="flex items-center gap-1.5 font-semibold text-white/90">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Démo
                </p>
                <p className="mt-1.5 leading-relaxed">
                  Email : <span className="font-mono text-white">a.diallo@sarahauto.ci</span>
                  <br />
                  Mot de passe : n&apos;importe lequel
                </p>
              </div>
            </TabsContent>

            {/* ============== TAB ELEVE ============== */}
            <TabsContent value="eleve" className="mt-6">
              <div className="mb-5 space-y-1">
                <h2 className="text-lg font-bold text-white">Connexion Élève</h2>
                <p className="text-sm text-white/60">Code dossier et numéro de téléphone</p>
              </div>

              <form onSubmit={handleEleveSubmit} className="space-y-4">
                {/* Code dossier */}
                <div className="space-y-1.5">
                  <label htmlFor="code" className="text-sm font-medium text-white/90">
                    Code dossier
                  </label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        resetError()
                      }}
                      placeholder="EL-XXXX"
                      className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-primary focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div className="space-y-1.5">
                  <label htmlFor="telephone" className="text-sm font-medium text-white/90">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      id="telephone"
                      type="tel"
                      value={telephone}
                      onChange={(e) => {
                        setTelephone(e.target.value)
                        resetError()
                      }}
                      placeholder="+225 07 12 34 56"
                      className="h-11 w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition-colors focus:border-primary focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Accéder à mon espace
                    </>
                  )}
                </button>
              </form>

              {/* Hint box */}
              <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/60 backdrop-blur-sm">
                <p className="flex items-center gap-1.5 font-semibold text-white/90">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Démo
                </p>
                <p className="mt-1.5 leading-relaxed">
                  Code : <span className="font-mono text-white">EL-2401</span>
                  <br />
                  Téléphone : <span className="font-mono text-white">+225 07 12 34 56</span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/50">
          Besoin d&apos;aide ? Contactez{' '}
          <span className="font-medium text-white/80">support@sarahauto.ci</span>
        </p>
        <p className="mt-2 text-center text-xs text-white/40">
          © {new Date().getFullYear()} SARAH AUTO — Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
