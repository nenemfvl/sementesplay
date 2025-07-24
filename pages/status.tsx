import React from 'react'
import Head from 'next/head'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const statusList = [
  { nome: 'Cashback', status: 'ok', descricao: 'Sistema de cashback funcionando normalmente.' },
  { nome: 'Repasses de Parceiros', status: 'ok', descricao: 'Repasses sendo processados normalmente.' },
  { nome: 'Fundo de Sementes', status: 'ok', descricao: 'Distribuição do fundo de sementes ativa.' },
  { nome: 'Pagamentos', status: 'ok', descricao: 'Pagamentos e carteiras operando normalmente.' },
  { nome: 'Notificações', status: 'ok', descricao: 'Envio de notificações funcionando.' },
  { nome: 'Painel do Usuário', status: 'ok', descricao: 'Acesso e funcionalidades normais.' },
  { nome: 'Painel do Parceiro', status: 'ok', descricao: 'Acesso e funcionalidades normais.' },
  { nome: 'Painel Admin', status: 'ok', descricao: 'Acesso e funcionalidades normais.' },
]

function getStatusIcon(status: string) {
  if (status === 'ok') return <CheckCircleIcon className="w-6 h-6 text-green-500" />
  if (status === 'instavel') return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
  return <XCircleIcon className="w-6 h-6 text-red-500" />
}

export default function Status() {
  return (
    <>
      <Head>
        <title>Status do Sistema - SementesPLAY</title>
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold text-sss-accent mb-4">Status do Sistema</h1>
        <p className="text-gray-300 mb-8 text-center max-w-xl">Aqui você acompanha o funcionamento dos principais serviços do SementesPLAY. Em caso de instabilidade, consulte esta página antes de abrir um chamado de suporte.</p>
        <div className="w-full max-w-2xl bg-sss-medium rounded-lg border border-sss-light p-6 mb-8">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-gray-400 font-medium p-2">Serviço</th>
                <th className="text-left text-gray-400 font-medium p-2">Status</th>
                <th className="text-left text-gray-400 font-medium p-2">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {statusList.map((item) => (
                <tr key={item.nome} className="border-b border-sss-light/30">
                  <td className="p-2 text-sss-white font-semibold">{item.nome}</td>
                  <td className="p-2">{getStatusIcon(item.status)}</td>
                  <td className="p-2 text-gray-300">{item.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="max-w-xl bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded text-blue-200 text-sm">
          <strong>Dica:</strong> Se algum serviço estiver instável ou fora do ar, aguarde alguns minutos e tente novamente. Persistindo o problema, entre em contato com o suporte pelo painel ou pelo e-mail suporte@sementesplay.com.
        </div>
      </div>
    </>
  )
} 