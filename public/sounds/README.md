# 🔊 Arquivos de Som para Notificações

## 📁 Estrutura dos Arquivos

Esta pasta contém os arquivos de áudio utilizados pelo sistema de notificações do SementesPLAY.

### 🎵 **Arquivos Necessários:**

| Arquivo | Uso | Duração Recomendada | Características |
|---------|-----|-------------------|----------------|
| `notification-default.mp3` | Som padrão | 1-2s | Neutro, agradável |
| `notification-donation.mp3` | Doações recebidas | 1.5s | Alegre, positivo |
| `notification-mission.mp3` | Missões completadas | 1s | Som de conquista |
| `notification-chat.mp3` | Mensagens de chat | 0.5s | Discreto, "pop" |
| `notification-success.mp3` | Ações bem-sucedidas | 1s | Energético, positivo |
| `notification-error.mp3` | Erros/alertas | 1s | Alerta sem ser assustador |
| `notification-ranking.mp3` | Mudanças de ranking | 1.5s | Especial, épico |
| `notification-system.mp3` | Notificações do sistema | 1s | Neutro, profissional |

---

## 🎛️ **Especificações Técnicas**

### **Formatos Suportados:**
- **MP3** (recomendado) - Melhor compatibilidade
- **WAV** - Qualidade máxima
- **OGG** - Alternativa open-source

### **Configurações Recomendadas:**
- **Taxa de bits:** 128 kbps (suficiente para notificações)
- **Taxa de amostragem:** 44.1 kHz
- **Canais:** Mono ou Estéreo
- **Volume:** Normalizado para -6dB a -3dB

---

## 🎨 **Características por Tipo de Som**

### **🔔 Default (notification-default.mp3)**
- Tom neutro e agradável
- Não deve ser intrusivo
- Referência para outros sons

### **💰 Doações (notification-donation.mp3)**
- Som alegre e celebrativo
- Pode incluir elementos musicais
- Transmitir sensação de recompensa

### **🎯 Missões (notification-mission.mp3)**
- Som de "achievement" ou conquista
- Pode incluir acordes ascendentes
- Sensação de progresso

### **💬 Chat (notification-chat.mp3)**
- Som muito discreto
- Tipo "pop", "ding" ou "click"
- Não deve incomodar conversas

### **✅ Sucesso (notification-success.mp3)**
- Som positivo e energético
- Confirma ação bem-sucedida
- Pode ser levemente musical

### **❌ Erro (notification-error.mp3)**
- Som de alerta mas não assustador
- Tom mais grave que os positivos
- Chama atenção sem assustar

### **🏆 Ranking (notification-ranking.mp3)**
- Som especial e épico
- Pode ser mais longo (até 2s)
- Transmitir importância do evento

### **⚙️ Sistema (notification-system.mp3)**
- Som neutro e profissional
- Para notificações administrativas
- Discreto mas perceptível

---

## 🛠️ **Como Implementar**

### **1. Substituir Arquivos Placeholder**
Os arquivos atuais são apenas placeholders de texto. Substitua-os pelos arquivos de áudio reais mantendo os mesmos nomes.

### **2. Testar Compatibilidade**
```javascript
// Teste básico de compatibilidade
const audio = new Audio('/sounds/notification-default.mp3')
audio.play().then(() => {
  console.log('Áudio funcionando!')
}).catch(err => {
  console.error('Erro no áudio:', err)
})
```

### **3. Otimização**
- Comprima os arquivos para reduzir tamanho
- Use ferramentas como Audacity ou Adobe Audition
- Teste em diferentes dispositivos

---

## 🎵 **Recursos para Encontrar Sons**

### **Sites Gratuitos:**
- **Freesound.org** - Sons CC gratuitos
- **Zapsplat** - Biblioteca extensa (requer cadastro)
- **Adobe Stock Audio** - Sons gratuitos limitados

### **Sons Premium:**
- **AudioJungle** - Marketplace de áudio
- **Pond5** - Sons profissionais
- **Artlist** - Subscriptions de áudio

### **Ferramentas de Edição:**
- **Audacity** (gratuito)
- **Adobe Audition** (pago)
- **GarageBand** (Mac, gratuito)

---

## 🔧 **Configuração no Código**

O sistema de som está implementado nos seguintes arquivos:

- `hooks/useNotificationSound.ts` - Hook principal
- `components/NotificationSoundSettings.tsx` - Interface de configuração
- `lib/notificacao.ts` - Integração com notificações
- `public/sw.js` - Service Worker para PWA

### **Como Usar:**

```typescript
import { useSimpleNotificationSound } from '../hooks/useNotificationSound'

const { playDonation, playMission, playChat } = useSimpleNotificationSound()

// Reproduzir som de doação
playDonation()

// Reproduzir som de missão
playMission()
```

---

## 📱 **Considerações Mobile**

### **iOS Safari:**
- Requer interação do usuário antes de reproduzir áudio
- Use `audio.play()` apenas após toque/clique

### **Android Chrome:**
- Melhor suporte a autoplay
- Funciona com Service Workers

### **PWA:**
- Sons funcionam mesmo com app instalado
- Service Worker gerencia reprodução em background

---

## 🎛️ **Configurações do Usuário**

Os usuários podem:
- ✅ Habilitar/desabilitar sons
- 🔊 Ajustar volume (0-100%)
- 🎵 Testar cada tipo de som
- ⚙️ Configurações salvas no localStorage

---

## 🚀 **Próximos Passos**

1. **Substituir placeholders** por arquivos MP3 reais
2. **Testar em dispositivos** diferentes
3. **Otimizar tamanhos** dos arquivos
4. **Adicionar mais tipos** se necessário
5. **Implementar cache** para performance

---

> **Nota:** Este sistema foi projetado para ser facilmente extensível. Para adicionar novos tipos de som, basta:
> 1. Adicionar o arquivo na pasta `/sounds/`
> 2. Incluir no objeto `defaultSounds` em `useNotificationSound.ts`
> 3. Adicionar ao mapeamento em `lib/notificacao.ts`
