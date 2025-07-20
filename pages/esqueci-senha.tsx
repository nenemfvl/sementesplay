import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailEnviado(true)
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      alert('Erro ao enviar email de recuperação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (emailEnviado) {
    return (
      <>
        <Head>
          <title>Email Enviado - SementesPLAY</title>
          <meta name="description" content="Email de recuperação enviado" />
        </Head>

        <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', color: '#e94560', marginBottom: '24px' }}>
                ← Voltar ao login
              </Link>
              
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                ✓
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                Email Enviado!
              </h2>
              <p style={{ color: '#d1d5db', marginBottom: '24px' }}>
                Enviamos um link de recuperação para <strong>{email}</strong>
              </p>
              
              <div style={{ backgroundColor: '#16213e', borderRadius: '8px', padding: '24px', border: '1px solid #0f3460' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ color: 'white', fontWeight: '500', marginBottom: '8px' }}>Próximos passos:</h3>
                  <ul style={{ color: '#d1d5db', fontSize: '14px', textAlign: 'left' }}>
                    <li>• Verifique sua caixa de entrada</li>
                    <li>• Clique no link de recuperação</li>
                    <li>• Crie uma nova senha</li>
                    <li>• Faça login com a nova senha</li>
                  </ul>
                </div>
                
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '12px' }}>
                  <p style={{ color: '#93c5fd', fontSize: '14px' }}>
                    ⚠️ O link expira em 1 hora por segurança
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <Link 
                  href="/login"
                  style={{ width: '100%', backgroundColor: '#e94560', color: 'white', fontWeight: '600', padding: '12px 16px', borderRadius: '8px', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Voltar ao Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Esqueci a Senha - SementesPLAY</title>
        <meta name="description" content="Recupere sua senha do SementesPLAY" />
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', color: '#e94560', marginBottom: '24px' }}>
              ← Voltar ao login
            </Link>
            
            <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(233, 69, 96, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              ✉️
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Esqueceu a senha?
            </h2>
            <p style={{ color: '#d1d5db' }}>
              Digite seu email para receber um link de recuperação
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ backgroundColor: '#16213e', borderRadius: '8px', padding: '24px', border: '1px solid #0f3460' }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: '#1a1a2e', border: '1px solid #0f3460', borderRadius: '8px', color: 'white' }}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  backgroundColor: loading ? '#6b7280' : '#e94560', 
                  color: 'white', 
                  fontWeight: '600', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
              </button>
            </div>

            {/* Info */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ color: '#d1d5db', fontSize: '14px' }}>
                Lembrou sua senha?{' '}
                <Link href="/login" style={{ color: '#e94560', fontWeight: '500' }}>
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  )
} 