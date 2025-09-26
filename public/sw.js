const CACHE_NAME = 'sementesplay-v1.0.0'
const STATIC_CACHE = 'sementesplay-static-v1.0.0'
const DYNAMIC_CACHE = 'sementesplay-dynamic-v1.0.0'

// Arquivos para cache estático (apenas arquivos que existem)
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-72x72.png'
]

// APIs que NÃO devem ser cacheadas (sempre buscar dados frescos)
const NO_CACHE_APIS = [
  '/api/ranking/criadores',
  '/api/ranking/doadores',
  '/api/ranking/missoes-conquistas',
  '/api/ranking/ciclos',
  '/api/admin/stats',
  '/api/conteudos/recentes',
  '/api/conteudos/populares',
  '/api/parceiros/ranking',
  '/api/notificacoes',
  '/api/usuario/atual'
]

// Estratégia de cache: Cache First para arquivos estáticos
const cacheFirst = async (request) => {
  // Não fazer cache de requisições POST
  if (request.method !== 'GET') {
    return fetch(request)
  }
  
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Retorna página offline se não conseguir buscar
    if (request.destination === 'document') {
      return caches.match('/offline.html')
    }
    throw error
  }
}

// Estratégia de cache: Network First para APIs (com fallback para cache)
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Só cachear se não for uma API que precisa de dados frescos E se for uma requisição GET
      const url = new URL(request.url)
      const shouldCache = !NO_CACHE_APIS.some(api => url.pathname.startsWith(api)) && 
                         request.method === 'GET'
      
      if (shouldCache) {
        const cache = await caches.open(DYNAMIC_CACHE)
        cache.put(request, networkResponse.clone())
      }
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Estratégia de cache: Network Only para APIs críticas
const networkOnly = async (request) => {
  try {
    return await fetch(request)
  } catch (error) {
    throw error
  }
}

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cache estático aberto')
        // Adicionar arquivos um por um para evitar falhas
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Falha ao adicionar ${url} ao cache:`, error)
              return null
            })
          )
        )
      })
      .then(() => {
        console.log('Arquivos estáticos processados')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Erro na instalação do Service Worker:', error)
        return self.skipWaiting()
      })
  )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Cache limpo')
        return self.clients.claim()
      })
  )
})

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Network Only para APIs críticas que precisam de dados frescos
  if (NO_CACHE_APIS.some(api => url.pathname.startsWith(api))) {
    event.respondWith(networkOnly(request))
    return
  }
  
  // Cache First para arquivos estáticos
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(cacheFirst(request))
    return
  }
  
  // Network First para outras APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }
  
  // Cache First para outros recursos
  event.respondWith(cacheFirst(request))
})

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Sincronização em background:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncData()
    )
  }
})

// Notificações push
self.addEventListener('push', (event) => {
  
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { body: event.data ? event.data.text() : 'Nova notificação do SementesPLAY' }
  }
  
  const options = {
    body: data.body || 'Nova notificação do SementesPLAY',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200], // Vibração mais intensa
    sound: '/sounds/notification-default.mp3', // Som padrão
    silent: false, // Garantir que não seja silenciosa
    requireInteraction: true, // Manter visível até interação
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      type: data.type || 'default',
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-72x72.png'
      }
    ],
    tag: data.tag || 'sementesplay-notification'
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'SementesPLAY', options)
  )
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  // Notificação clicada - processar ação
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Função para sincronizar dados
async function syncData() {
  try {
    // Sincronizar dados offline
    const offlineData = await getOfflineData()
    
    if (offlineData.length > 0) {
      console.log('Sincronizando dados offline:', offlineData.length)
      
      for (const data of offlineData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: data.body
          })
          
          // Remove dados sincronizados
          await removeOfflineData(data.id)
        } catch (error) {
          console.error('Erro ao sincronizar:', error)
        }
      }
    }
  } catch (error) {
    console.error('Erro na sincronização:', error)
  }
}

// Funções auxiliares para dados offline
async function getOfflineData() {
  // Implementar lógica para buscar dados salvos offline
  return []
}

async function removeOfflineData(id) {
  // Implementar lógica para remover dados sincronizados
  console.log('Dados removidos:', id)
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
}) 