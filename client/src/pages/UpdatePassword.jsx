// src/pages/UpdatePassword.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabase } from '../supabaseClient'

function getErrorMessage(err) {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') return err.message
  return 'Erro desconhecido'
}

export default function UpdatePassword() {
  const navigate = useNavigate()
  const sb = getSupabase()

  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    let unsub = null

    const run = async () => {
      try {
        await sb.auth.getSession()
      } catch (e) {
        console.error(e)
      } finally {
        setReady(true)
      }

      const { data } = sb.auth.onAuthStateChange(() => {})
      unsub = () => data.subscription.unsubscribe()
    }

    run()
    return () => unsub?.()
  }, [sb])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (loading) return

    if (!password || password.length < 8) return toast.error('A senha deve ter pelo menos 8 caracteres.')
    if (password !== confirm) return toast.error('As senhas não conferem.')

    setLoading(true)
    try {
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw error

      toast.success('Senha atualizada com sucesso! ✅')
      navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Definir nova senha</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Digite e confirme sua nova senha para concluir a recuperação.
        </p>

        {!ready ? (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Loader2 className="animate-spin" size={18} /> Preparando...
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar senha</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="block w-full px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin inline" size={18} /> : 'Atualizar senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
