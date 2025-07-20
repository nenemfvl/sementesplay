import React from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Termos() {
  return (
    <>
      <Head>
        <title>Termos de Uso - SementesPLAY</title>
        <meta name="description" content="Termos de uso do SementesPLAY" />
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
                  <p className="text-sm text-gray-300">Termos de Uso</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <DocumentTextIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Termos de Uso
              </h2>
              <p className="text-gray-300">
                Última atualização: 15 de Janeiro de 2024
              </p>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-sss-medium rounded-lg p-8 border border-sss-light space-y-6"
            >
              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">1. Aceitação dos Termos</h3>
                <p className="text-gray-300 leading-relaxed">
                  Ao acessar e usar o SementesPLAY, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                  Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">2. Descrição do Serviço</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  O SementesPLAY é uma plataforma que conecta jogadores, criadores de conteúdo e donos de cidades FiveM 
                  através de um sistema de cashback e doações.
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Sistema de cashback de 10% em compras nas cidades FiveM</li>
                  <li>• Doações para criadores de conteúdo</li>
                  <li>• Ranking e níveis de criadores</li>
                  <li>• Geração de códigos de cashback por parceiros</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">3. Tipos de Conta</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sss-accent font-medium mb-2">Usuários</h4>
                    <p className="text-gray-300 text-sm">
                      Podem receber cashback, doar para criadores e participar do ranking.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sss-accent font-medium mb-2">Criadores</h4>
                    <p className="text-gray-300 text-sm">
                      Recebem doações, participam do ranking e podem se tornar parceiros.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sss-accent font-medium mb-2">Parceiros</h4>
                    <p className="text-gray-300 text-sm">
                      Donos de cidades que geram códigos de cashback e pagam taxa mensal.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">4. Regras de Uso</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Você concorda em não:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Usar a plataforma para atividades ilegais</li>
                  <li>• Tentar hackear ou comprometer a segurança</li>
                  <li>• Criar contas falsas ou múltiplas</li>
                  <li>• Spam ou comportamento tóxico</li>
                  <li>• Violar direitos autorais ou propriedade intelectual</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">5. Pagamentos e Taxas</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sss-accent font-medium mb-2">Cashback</h4>
                    <p className="text-gray-300 text-sm">
                      10% de cashback em Sementes para compras nas cidades parceiras.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sss-accent font-medium mb-2">Doações</h4>
                    <p className="text-gray-300 text-sm">
                      Criadores recebem 90% das doações, 10% é retido para manutenção.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sss-accent font-medium mb-2">Parceiros</h4>
                    <p className="text-gray-300 text-sm">
                      Taxa mensal de R$ 500,00 para acesso ao painel de parceiros.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">6. Privacidade</h3>
                <p className="text-gray-300 leading-relaxed">
                  Suas informações pessoais são protegidas conforme nossa Política de Privacidade. 
                  Não compartilhamos dados com terceiros sem seu consentimento.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">7. Limitação de Responsabilidade</h3>
                <p className="text-gray-300 leading-relaxed">
                  O SementesPLAY não se responsabiliza por perdas financeiras, danos indiretos ou 
                  consequências decorrentes do uso da plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">8. Modificações</h3>
                <p className="text-gray-300 leading-relaxed">
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                  Mudanças serão comunicadas através da plataforma.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">9. Contato</h3>
                <p className="text-gray-300 leading-relaxed">
                  Para dúvidas sobre estes termos, entre em contato conosco através do suporte.
                </p>
              </section>

              <div className="border-t border-sss-light pt-6">
                <p className="text-gray-400 text-sm text-center">
                  Ao usar o SementesPLAY, você confirma que leu, entendeu e concorda com estes Termos de Uso.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 