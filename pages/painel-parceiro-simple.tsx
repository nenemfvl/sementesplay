import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function PainelParceiroSimple() {
  const [pagamentoPIX, setPagamentoPIX] = useState<any>(null);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);

  async function handleFazerPagamentoPIX() {
    try {
      const response = await fetch('/api/pix-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repasseId: 'teste',
          parceiroId: 'teste',
          usuarioId: 'teste'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPagamentoPIX(data);
        verificarPagamento(data.paymentId);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao gerar pagamento PIX');
      }
    } catch (error) {
      alert('Erro ao gerar pagamento PIX');
    }
  }

  async function verificarPagamento(paymentId: string) {
    setVerificandoPagamento(true);
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/verificar-pagamento-simple?paymentId=${paymentId}&usuarioId=teste`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'confirmado') {
            clearInterval(interval);
            setVerificandoPagamento(false);
            alert('Pagamento confirmado com sucesso!');
            setPagamentoPIX(null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      setVerificandoPagamento(false);
    }, 300000);
  }

  return (
    <>
      <Head>
        <title>Painel do Parceiro | SementesPLAY</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Painel do Parceiro - Versão Simples</h1>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Teste PIX</h2>
            
            <button
              onClick={handleFazerPagamentoPIX}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Gerar Pagamento PIX
            </button>

            {pagamentoPIX && (
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Pagamento PIX</h3>
                <p className="text-gray-300">Chave PIX: {pagamentoPIX.pixData.chavePix}</p>
                <p className="text-gray-300">Valor: R$ {pagamentoPIX.pixData.valor}</p>
                <p className="text-gray-300">Beneficiário: {pagamentoPIX.pixData.beneficiario.nome}</p>
                
                {verificandoPagamento && (
                  <div className="mt-4 text-yellow-400">
                    Verificando pagamento... Aguarde a confirmação automática
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 