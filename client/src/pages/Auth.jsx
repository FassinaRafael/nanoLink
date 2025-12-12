// src/pages/Auth.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Lock, Mail, Loader2, ArrowRight, Moon, Sun, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { clearAuthArtifacts, getCurrentStorageMode, getSupabase, initSupabase } from '../supabaseClient'

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

function getErrorMessage(err) {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message
  try { return JSON.stringify(err) } catch { return 'Erro desconhecido' }
}

export default function Auth() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)

  // Campos
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Controle
  const [isSignUp, setIsSignUp] = useState(false)

  // Remember me (local vs session)
  const defaultRemember = useMemo(() => getCurrentStorageMode() === 'local', [])
  const [rememberMe, setRememberMe] = useState(defaultRemember)

  // Tema
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  // Boot: checa sessão + listener
  useEffect(() => {
    const sb = getSupabase()
    let unsub = null

    const run = async () => {
      try {
        const { data, error } = await sb.auth.getSession()
        if (error) throw error
        if (data.session) navigate('/dashboard')
      } catch (err) {
        console.error('Erro getSession:', err)
      } finally {
        setBooting(false)
      }

      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        if (session) navigate('/dashboard')
      })
      unsub = () => data.subscription.unsubscribe()
    }

    run()
    return () => unsub?.()
  }, [navigate])

  const handleAuth = async (e) => {
    e.preventDefault()
    if (loading) return

    const safeEmail = normalizeEmail(email)

    if (!safeEmail) return toast.error('Informe um e-mail válido.')
    if (!password || password.length < 8) return toast.error('A senha deve ter pelo menos 8 caracteres.')

    setLoading(true)
    try {
      const sb = getSupabase()

      if (isSignUp) {
        const { data, error } = await sb.auth.signUp({
          email: safeEmail,
          password,
          options: {
            // se confirmação de email estiver ligada, isso define o destino após confirmar
            emailRedirectTo: window.location.origin + '/dashboard',
          },
        })

        if (error) {
          const msg = (error.message || '').toLowerCase()
          if (msg.includes('already registered') || msg.includes('already exists')) {
            toast.error('Esse e-mail já está cadastrado. Faça login ou use "Esqueceu a senha?".')
            return
          }
          throw error
        }

        // ✅ Caso comum: e-mail já existe e o Supabase “não acusa” por segurança.
        // Nesse caso, geralmente identities vem vazio.
        const identitiesLen = data?.user?.identities?.length
        if (identitiesLen === 0) {
          toast.error('Esse e-mail já está cadastrado. Faça login ou use "Esqueceu a senha?".')
          return
        }

        // ✅ Mensagem verdadeira (não promete e-mail)
        toast.success('Se este e-mail puder receber cadastro, você receberá uma mensagem para confirmar.')
        return
      }

      // LOGIN
      const mode = rememberMe ? 'local' : 'session'

      clearAuthArtifacts()
      const sbLogin = initSupabase(mode)

      const { error } = await sbLogin.auth.signInWithPassword({
        email: safeEmail,
        password,
      })
      if (error) throw error

      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const safeEmail = normalizeEmail(email)
    if (!safeEmail) return toast.error('Digite seu e-mail no campo acima para recuperar a senha.')

    setLoading(true)
    try {
      const sb = getSupabase()
      const { error } = await sb.auth.resetPasswordForEmail(safeEmail, {
        redirectTo: window.location.origin + '/update-password',
      })
      if (error) throw error

      // ✅ Mensagem neutra (por segurança/privacidade)
      toast.success('Se este e-mail existir, você receberá um link para redefinir a senha.')
    } catch (err) {
      toast.error('Erro ao enviar recuperação: ' + getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Lado Esquerdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 dark:bg-blue-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl mb-2">
            <Link2 className="text-blue-200" /> NanoLink
          </div>
          <p className="text-blue-100">Gerenciamento de links inteligente.</p>
        </div>

        <div className="relative z-10 mb-20">
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Transforme links longos em <span className="text-blue-200">conexões instantâneas.</span>
          </h1>
          <ul className="space-y-4 text-lg text-blue-100">
            <li className="flex items-center gap-3"><CheckCircle2 size={20} /> Analytics em tempo real</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={20} /> QR Codes automáticos</li>
            <li className="flex items-center gap-3"><CheckCircle2 size={20} /> Links personalizados</li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © 2025 NanoLink Inc. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Alternar tema"
          type="button"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Crie sua conta grátis' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isSignUp ? 'Comece a gerenciar seus links hoje mesmo.' : 'Insira suas credenciais para acessar o painel.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Lembrar de mim
                </label>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading || booting}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-60"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || booting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {(loading || booting) ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar na Plataforma'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                type="button"
              >
                {isSignUp ? 'Fazer Login' : 'Cadastre-se agora'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
