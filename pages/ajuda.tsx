import React, { useState } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  QuestionMarkCircleIcon, 
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Ajuda() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      id: 1,
      pergunta: "Como funciona o sistema de cashback?",
      resposta: "O sistema de cashback funciona da seguinte forma: quando você faz compras nas cidades FiveM parceiras, recebe automaticamente 10% do valor em Sementes. O parceiro faz o repasse do cashback através do painel de parceiros, e você pode acompanhar o status na sua página de cashback."
    },
    {
      id: 2,
      pergunta: "Como posso doar para criadores?",
      resposta: "Para doar, acesse o perfil do criador ou use a página de doações. Escolha o valor em Sementes e opcionalmente deixe uma mensagem. O criador receberá 90% do valor, e 10% é retido para manutenção da plataforma."
    },
    {
      id: 3,
      pergunta: "Quais são os níveis dos criadores?",
      resposta: "Existem 3 níveis: Supremo (top 100), Parceiro (posições 101-300) e Comum (demais criadores). Cada nível oferece benefícios diferentes como destaque no site, emblemas especiais e recompensas do fundo de sementes."
    },
    {
      id: 4,
      pergunta: "Como me torno um parceiro?",
      resposta: "Para se tornar parceiro, você precisa ser dono de uma cidade FiveM. Entre em contato conosco para mais informações sobre o processo de cadastro. O acesso ao painel de parceiros é gratuito e permite gerenciar solicitações de cashback e repasses."
    },
    {
      id: 5,
      pergunta: "Como funcionam os repasses de cashback?",
      resposta: "Os repasses são feitos pelos parceiros através do painel de parceiros. Quando você faz uma compra em uma cidade parceira, o parceiro recebe a solicitação de cashback e pode aprovar ou rejeitar. Após aprovado, o repasse é processado via PIX."
    },
    {
      id: 6,
      pergunta: "Posso solicitar saques de Sementes?",
      resposta: "Apenas criadores podem solicitar saques de Sementes para PIX. O valor mínimo para saque é R$ 1,00. Usuários comuns podem usar suas Sementes para doações e outras funcionalidades da plataforma."
    },
    {
      id: 7,
      pergunta: "Como funciona o ranking dos criadores?",
      resposta: "O ranking é baseado na quantidade de Sementes recebidas, número de apoiadores e engajamento. É atualizado periodicamente e determina os níveis dos criadores. Criadores também recebem parte do fundo de sementes distribuído periodicamente."
    },
    {
      id: 8,
      pergunta: "Posso cancelar uma doação?",
      resposta: "Não, as doações são processadas instantaneamente e não podem ser canceladas. Certifique-se de escolher o criador e valor corretos antes de confirmar."
    },
    {
      id: 9,
      pergunta: "Como funciona o fundo de sementes?",
      resposta: "O fundo de sementes é distribuído periodicamente: 50% para criadores (proporcional ao conteúdo) e 50% para usuários (proporcional aos gastos). A distribuição é feita automaticamente pelo sistema."
    },
    {
      id: 10,
      pergunta: "O que são os emblemas?",
      resposta: "Emblemas são conquistas visuais que representam marcos importantes na jornada do usuário. São desbloqueados ao atingir certos níveis ou completar atividades específicas na plataforma."
    }
  ]

  const categorias = [
    {
      titulo: "Primeiros Passos",
      icon: "🚀",
      descricao: "Como começar a usar o SementesPLAY",
      link: "#primeiros-passos"
    },
    {
      titulo: "Cashback",
      icon: "💳",
      descricao: "Tudo sobre o sistema de cashback e repasses",
      link: "#cashback"
    },
    {
      titulo: "Doações",
      icon: "💝",
      descricao: "Como doar para criadores",
      link: "#doacoes"
    },
    {
      titulo: "Criadores",
      icon: "🎬",
      descricao: "Informações para criadores de conteúdo",
      link: "#criadores"
    },
    {
      titulo: "Parceiros",
      icon: "🏢",
      descricao: "Como se tornar um parceiro",
      link: "#parceiros"
    },
    {
      titulo: "Suporte",
      icon: "🆘",
      descricao: "Entre em contato conosco",
      link: "#suporte"
    }
  ]

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <>
      <Head>
        <title>Ajuda - SementesPLAY</title>
        <meta name="description" content="Central de ajuda e suporte SementesPLAY" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/" className="inline-flex items-center text-sss-accent hover:text-red-400">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Voltar ao Início
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-sss-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-sss-white">SementesPLAY</h1>
                  <p className="text-sm text-gray-300">Central de Ajuda</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QuestionMarkCircleIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Como podemos ajudar?
              </h2>
              <p className="text-gray-300">
                Encontre respostas para suas dúvidas ou entre em contato
              </p>
            </div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {categorias.map((categoria, index) => (
                <motion.div
                  key={categoria.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="bg-sss-medium rounded-lg p-6 border border-sss-light hover:border-sss-accent/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById(categoria.link.slice(1))?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">{categoria.icon}</div>
                    <h3 className="text-lg font-semibold text-sss-white mb-2">
                      {categoria.titulo}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {categoria.descricao}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-sss-medium rounded-lg p-8 border border-sss-light"
            >
              <h3 className="text-2xl font-bold text-sss-white mb-6 text-center">
                Perguntas Frequentes
              </h3>
              
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: faq.id * 0.1 }}
                    className="border border-sss-light rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 bg-sss-dark hover:bg-sss-light transition-colors flex items-center justify-between text-left"
                    >
                      <span className="text-sss-white font-medium">{faq.pergunta}</span>
                      {openFaq === faq.id ? (
                        <ChevronUpIcon className="w-5 h-5 text-sss-accent" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {openFaq === faq.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-4 bg-sss-medium"
                      >
                        <p className="text-gray-300 leading-relaxed">
                          {faq.resposta}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-sss-medium rounded-lg p-8 border border-sss-light"
            >
              <h3 className="text-2xl font-bold text-sss-white mb-6 text-center">
                Ainda precisa de ajuda?
              </h3>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-sss-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-sss-accent" />
                </div>
                <h4 className="text-lg font-semibold text-sss-white mb-2">
                  Chat ao Vivo
                </h4>
                <p className="text-gray-300 text-sm mb-4">
                  Fale diretamente com nossa equipe
                </p>
                <Link href="/suporte" className="inline-flex items-center bg-sss-accent hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Iniciar Chat
                </Link>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-sss-light rounded-lg p-6 border border-sss-medium"
            >
              <h3 className="text-lg font-semibold text-sss-white mb-4">
                Links Úteis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/termos" className="text-sss-accent hover:text-red-400 text-sm">
                  Termos de Uso
                </Link>
                <Link href="/privacidade" className="text-sss-accent hover:text-red-400 text-sm">
                  Política de Privacidade
                </Link>

              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 