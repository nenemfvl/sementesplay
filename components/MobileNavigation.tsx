import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useNavigation } from '../hooks/useNavigation'
import { 
  HomeIcon,
  HeartIcon,
  TrophyIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  GiftIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid,
  HeartIcon as HeartIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  GiftIcon as GiftIconSolid,
  CogIcon as CogIconSolid
} from '@heroicons/react/24/solid'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/status',
    icon: HomeIcon,
    iconSolid: HomeIconSolid
  },
  {
    name: 'Doar',
    href: '/doar',
    icon: HeartIcon,
    iconSolid: HeartIconSolid
  },
  {
    name: 'Ranking',
    href: '/ranking',
    icon: TrophyIcon,
    iconSolid: TrophyIconSolid
  },
  {
    name: 'Criadores',
    href: '/criadores',
    icon: UserGroupIcon,
    iconSolid: UserGroupIconSolid
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: ChatBubbleLeftIcon,
    iconSolid: ChatBubbleLeftIconSolid
  },
  {
    name: 'Missões',
    href: '/missoes',
    icon: GiftIcon,
    iconSolid: GiftIconSolid
  },
  {
    name: 'Config',
    href: '/configuracoes',
    icon: CogIcon,
    iconSolid: CogIconSolid
  }
]

export default function MobileNavigation() {
  const router = useRouter()
  const { navigateTo, isNavigating } = useNavigation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sss-medium border-t border-sss-light">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const isActive = router.pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon
          
          return (
            <button
              key={item.name}
              onClick={() => navigateTo(item.href)}
              disabled={isNavigating}
              className="flex flex-col items-center justify-center p-2 min-w-0 flex-1 disabled:opacity-50"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon 
                  className={`w-6 h-6 ${
                    isActive 
                      ? 'text-sss-accent' 
                      : 'text-gray-400'
                  }`} 
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-sss-accent rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span 
                className={`text-xs mt-1 ${
                  isActive 
                    ? 'text-sss-accent font-medium' 
                    : 'text-gray-400'
                }`}
              >
                {item.name}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* Indicador de segurança para dispositivos com notch */}
      <div className="h-1 bg-sss-dark" />
    </div>
  )
} 