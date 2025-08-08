import React from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Privacidade() {
  return (
    <>
      <Head>
        <title>Política de Privacidade - SementesPLAY</title>
        <meta name="description" content="Política de privacidade do SementesPLAY" />
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
                  <p className="text-sm text-gray-300">Política de Privacidade</p>
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
                  <ShieldCheckIcon className="w-10 h-10 text-sss-accent" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-bold text-sss-white mb-2">
                Política de Privacidade
              </h2>
              <p className="text-gray-300">
                Última atualização: 8 de Agosto de 2024
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
                <h3 className="text-xl font-semibold text-sss-white mb-4">1. Informações que Coletamos</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Coletamos informações que você nos fornece diretamente, como:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Informações de conta (nome, email, senha)</li>
                  <li>• Informações de perfil (avatar, biografia)</li>
                  <li>• Informações de pagamento e transações</li>
                  <li>• Comunicações com nossa equipe de suporte</li>
                  <li>• Conteúdo que você compartilha na plataforma</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">2. Como Usamos Suas Informações</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Utilizamos suas informações para:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Fornecer e manter nossos serviços</li>
                  <li>• Processar transações e pagamentos</li>
                  <li>• Enviar notificações importantes</li>
                  <li>• Melhorar e personalizar sua experiência</li>
                  <li>• Detectar e prevenir fraudes</li>
                  <li>• Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">3. Compartilhamento de Informações</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Com seu consentimento explícito</li>
                  <li>• Para processar pagamentos (processadores de pagamento)</li>
                  <li>• Para cumprir obrigações legais</li>
                  <li>• Para proteger nossos direitos e segurança</li>
                  <li>• Com parceiros FiveM conforme necessário para o cashback</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">4. Segurança dos Dados</h3>
                <p className="text-gray-300 leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL/TLS para proteger dados em trânsito e armazenamento seguro para dados em repouso.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">5. Seus Direitos</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Você tem os seguintes direitos relacionados aos seus dados pessoais:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Acessar suas informações pessoais</li>
                  <li>• Corrigir informações imprecisas</li>
                  <li>• Solicitar a exclusão de seus dados</li>
                  <li>• Limitar o processamento de seus dados</li>
                  <li>• Portabilidade de seus dados</li>
                  <li>• Revogar consentimento a qualquer momento</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">6. Cookies e Tecnologias Similares</h3>
                <p className="text-gray-300 leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma e personalizar conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">7. Retenção de Dados</h3>
                <p className="text-gray-300 leading-relaxed">
                  Mantemos suas informações pessoais apenas pelo tempo necessário para fornecer nossos serviços, cumprir obrigações legais, resolver disputas e fazer cumprir nossos acordos. Quando não precisarmos mais de suas informações, as excluímos de forma segura.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">8. Menores de Idade</h3>
                <p className="text-gray-300 leading-relaxed">
                  Nossos serviços não são destinados a menores de 13 anos. Não coletamos intencionalmente informações pessoais de menores de 13 anos. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">9. Alterações nesta Política</h3>
                <p className="text-gray-300 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas através de email ou através de um aviso em nossa plataforma. Recomendamos que você revise esta política regularmente.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-sss-white mb-4">10. Contato</h3>
                <p className="text-gray-300 leading-relaxed">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, entre em contato conosco através do nosso sistema de suporte ou envie um email para nossa equipe de privacidade.
                </p>
              </section>

              <div className="border-t border-sss-light pt-6 mt-8">
                <p className="text-sm text-gray-400 text-center">
                  Ao usar o SementesPLAY, você confirma que leu, entendeu e concorda com esta Política de Privacidade.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
