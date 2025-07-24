import React, { useEffect, useState } from 'react'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  lida: boolean
  data: string
}

export default function Notificacoes({ usuarioId }: { usuarioId: string }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuarioId) return
    fetch(`/api/notificacoes?usuarioId=${usuarioId}`)
      .then(res => res.json())
      .then(data => setNotificacoes(data.notificacoes || []))
      .finally(() => setLoading(false))
  }, [usuarioId])

  if (loading) return null
  if (notificacoes.length === 0) return null

  return (
    <div className="mb-4">
      <div className="bg-sss-medium rounded-lg p-4 border border-sss-light">
        <h4 className="text-lg font-bold text-sss-accent mb-2">Notificações</h4>
        <ul className="space-y-2">
          {notificacoes.slice(0, 5).map((n) => (
            <li key={n.id} className={`p-2 rounded ${n.lida ? 'bg-gray-800 text-gray-400' : 'bg-green-900/20 text-sss-white'}`}>
              <div className="font-semibold">{n.titulo}</div>
              <div className="text-sm">{n.mensagem}</div>
              <div className="text-xs text-gray-400">{new Date(n.data).toLocaleDateString('pt-BR')}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 