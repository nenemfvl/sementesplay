import React from 'react'
import Head from 'next/head'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon, 
  HeartIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  PlayIcon,
  StarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { auth } from '../lib/auth';

export default function Home() {
  const [activeTab, setActiveTab] = useState('como-funciona')
  const user = typeof window !== 'undefined' ? auth.getUser() : null;

  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'Cashback de 10%',
      description: 'Receba Sementes equivalentes a 10% de todas as suas compras em cidades FiveM parceiras.'
    },
    {
      icon: HeartIcon,
      title: 'Doações para Criadores',
      description: 'Doe suas Sementes para seus criadores de conteúdo favoritos e ajude-os a crescer.'
    },
    {
      icon: UserGroupIcon,
      title: 'Comunidade Ativa',
      description: 'Faça parte de uma comunidade vibrante de jogadores e criadores de conteúdo.'
    },
    {
      icon: ChartBarIcon,
      title: 'Sistema de Ranking',
      description: 'Criadores são ranqueados por engajamento e recebem benefícios especiais.'
    }
  ]

  const niveis = [
    {
      nome: 'Supremo',
      cor: 'purple',
      requisitos: 'Top 100 criadores',
      beneficios: ['Destaque na plataforma', 'Recompensas especiais', 'Missões exclusivas']
    },
    {
      nome: 'Parceiro',
      cor: 'blue',
      requisitos: 'Top 101-300 criadores',
      beneficios: ['Destaque na plataforma', 'Recompensas médias', 'Missões especiais']
    },
    {
      nome: 'Comum',
      cor: 'gray',
      requisitos: 'Demais criadores',
      beneficios: ['Recompensas básicas', 'Missões comuns']
    }
  ]

  return (
    <>
      <Head>
        <title>SementesPLAY - Sistema de Cashback e Doações</title>
        <meta name="description" content="Sistema de cashback e doações para o ecossistema FiveM. Receba 10% de cashback em compras e doe para criadores de conteúdo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-sss-dark">
        {/* Header */}
        <header className="bg-sss-medium shadow-lg border-b border-sss-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gradient">
                    🌱 SementesPLAY
                  </h1>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-sss-white hover:text-sss-accent">Início</a>
                <a href="/status" className="text-sss-white hover:text-sss-accent">Status</a>
                <a href="#beneficios" className="text-sss-white hover:text-sss-accent">Benefícios</a>
                <a href="#niveis" className="text-sss-white hover:text-sss-accent">Níveis</a>
                <a href="#parceiros" className="text-sss-white hover:text-sss-accent">Parceiros</a>
                <a href="/dashboard" className="text-sss-white hover:text-sss-accent">Dashboard</a>
              </nav>
              <div className="flex space-x-4 items-center">
                {user ? (
                  <>
                    <span className="text-sss-white font-medium">{user.nome}</span>
                    <button onClick={() => { auth.logout(); window.location.reload(); }} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
                      <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="btn-outline">Entrar</a>
                    <a href="/registro" className="btn-primary">Cadastrar</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold text-sss-white mb-6">
                  Sistema de{' '}
                  <span className="text-gradient">Cashback</span>
                  <br />
                  e <span className="text-gradient">Doações</span>
                </h1>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Receba 10% de cashback em todas as suas compras em cidades FiveM parceiras 
                  e doe para seus criadores de conteúdo favoritos.
                </p>
              </motion.div>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <a href="/registro" className="btn-primary text-lg px-8 py-3">
                  Começar Agora
                </a>
                <a href="#como-funciona" className="btn-outline text-lg px-8 py-3">
                  Saiba Mais
                </a>
              </motion.div>
            </div>
          </div>
        </section>

                 {/* Features Section */}
         <section id="como-funciona" className="py-20 bg-sss-medium">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-sss-white mb-4">
                 Como Funciona
               </h2>
               <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                O SementesPLAY é um sistema cíclico que conecta jogadores, criadores de conteúdo e donos de cidades FiveM.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="card text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                                     <div className="w-12 h-12 bg-sss-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                     <feature.icon className="w-6 h-6 text-sss-accent" />
                   </div>
                   <h3 className="text-lg font-semibold text-sss-white mb-2">
                     {feature.title}
                   </h3>
                   <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

                 {/* Níveis Section */}
         <section id="niveis" className="py-20 bg-sss-dark">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-sss-white mb-4">
                 Níveis de Criadores
               </h2>
               <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Criadores são ranqueados por engajamento e recebem benefícios especiais baseados em seu nível.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {niveis.map((nivel, index) => (
                <motion.div
                  key={nivel.nome}
                  className="card text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className={`w-16 h-16 bg-${nivel.cor}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <StarIcon className={`w-8 h-8 text-${nivel.cor}-600`} />
                  </div>
                  <h3 className={`text-xl font-bold text-${nivel.cor}-600 mb-2`}>
                    {nivel.nome}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {nivel.requisitos}
                  </p>
                  <ul className="text-left space-y-2">
                    {nivel.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 bg-${nivel.cor}-400 rounded-full mr-2`}></div>
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

                 {/* CTA Section */}
         <section className="py-20 bg-gradient-to-r from-sss-accent to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se à comunidade SementesPLAY e comece a receber cashback 
              enquanto apoia seus criadores favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/registro" className="bg-white text-sss-accent font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                Criar Conta Grátis
              </a>
              <a href="/login" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-sss-accent transition-colors">
                Já tenho conta
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <a href="/ranking" className="text-white/80 hover:text-white text-sm">
                Ranking de Criadores
              </a>
              <a href="/buscar" className="text-white/80 hover:text-white text-sm">
                Buscar Criadores
              </a>
              <a href="/termos" className="text-white/80 hover:text-white text-sm">
                Termos de Uso
              </a>
              <a href="/ajuda" className="text-white/80 hover:text-white text-sm">
                Ajuda
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">🌱 SementesPLAY</h3>
                <p className="text-gray-400">
                  Sistema de cashback e doações para o ecossistema FiveM.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#como-funciona" className="hover:text-white">Como Funciona</a></li>
                  <li><a href="#beneficios" className="hover:text-white">Benefícios</a></li>
                  <li><a href="#niveis" className="hover:text-white">Níveis</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Suporte</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/ajuda" className="hover:text-white">Central de Ajuda</a></li>
                  <li><a href="/contato" className="hover:text-white">Contato</a></li>
                  <li><a href="/faq" className="hover:text-white">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/termos" className="hover:text-white">Termos de Uso</a></li>
                  <li><a href="/privacidade" className="hover:text-white">Política de Privacidade</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 SementesPLAY. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 