import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-sss-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="SementesPLAY Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-sss-accent">SementesPLAY</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plataforma completa para apoiar criadores de conteúdo. Conectamos talentos, 
              facilitamos colaborações e construímos uma comunidade vibrante de criadores.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-sss-accent font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Status
                </Link>
              </li>
              <li>
                <Link href="/salao" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Salão
                </Link>
              </li>
              <li>
                <Link href="/parceiros" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Parceiros
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte e contato */}
          <div>
            <h3 className="text-sss-accent font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/suporte" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-300 hover:text-sss-accent text-sm transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes sociais e copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 md:mb-0">
              <a href="https://discord.gg/7vtVZYvR" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-sss-accent transition-colors" title="Discord">
                <i className="fab fa-discord fa-lg"></i>
              </a>
              <a href="https://www.instagram.com/sementesplay/" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-sss-accent transition-colors" title="Instagram">
                <i className="fab fa-instagram fa-lg"></i>
              </a>
              <a href="https://www.tiktok.com/@sementesplay" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-sss-accent transition-colors" title="TikTok">
                <i className="fab fa-tiktok fa-lg"></i>
              </a>
              <a href="https://www.youtube.com/@SementesPLAY" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-sss-accent transition-colors" title="YouTube">
                <i className="fab fa-youtube fa-lg"></i>
              </a>
              <a href="https://x.com/SementesPLAY" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-sss-accent transition-colors" title="Twitter">
                <i className="fab fa-twitter fa-lg"></i>
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 SementesPLAY. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
