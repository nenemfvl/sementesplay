import React from 'react'
import Head from 'next/head'

export default function Salao() {
  return (
    <>
      <Head>
        <title>Salão - SementesPLAY</title>
        <meta name="description" content="Salão da comunidade SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col items-center justify-center">
        <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center">
          <h1 className="text-3xl font-bold text-sss-accent mb-4">Salão da Comunidade</h1>
          <p className="text-sss-white text-lg mb-2">Bem-vindo ao Salão! Em breve, novidades e interações para toda a comunidade. 🎉</p>
        </div>
      </div>
    </>
  )
} 