import React from 'react'
import Head from 'next/head'

export default function Status() {
  return (
    <>
      <Head>
        <title>Status - SementesPLAY</title>
        <meta name="description" content="Status do sistema SementesPLAY" />
      </Head>
      <div className="min-h-screen bg-sss-dark flex flex-col items-center justify-center">
        <div className="bg-sss-medium rounded-lg shadow-lg p-8 border border-sss-light text-center">
          <h1 className="text-3xl font-bold text-sss-accent mb-4">Status do Sistema</h1>
          <p className="text-sss-white text-lg mb-2">Tudo funcionando normalmente! 🚀</p>
          <span className="inline-block mt-2 px-4 py-1 rounded bg-green-600 text-white font-semibold">Online</span>
        </div>
      </div>
    </>
  )
} 