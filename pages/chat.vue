<template>
  <div class="h-full flex flex-col w-full">
    <!-- Chat area -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto chat-scroll px-4 py-8">
      <div class="max-w-3xl mx-auto space-y-6">

        <!-- Welcome -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
          <div class="w-20 h-20 rounded-none bg-psf-green-900 flex items-center justify-center mb-8 border border-psf-green-900/10">
            <svg class="w-10 h-10 text-psf-lime-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <h2 class="mb-4">
            Bonjour<br>Je suis Neotravel
          </h2>
          <p class="font-body text-lg text-psf-green-900/70 mb-10 max-w-md">
            L'assistant dédié à votre réservation de groupe. Où allons-nous ?
          </p>
          <div class="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
            <button
              v-for="s in suggestions" :key="s"
              @click="sendMessage(s)"
              class="flex-1 font-body text-sm border border-psf-green-900/20 bg-white px-5 py-4 text-psf-green-900 hover:border-psf-green-900 hover:bg-psf-green-900 hover:text-psf-cream-100 transition-all duration-200 text-left uppercase tracking-widest font-bold"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Messages -->
        <template v-for="(msg, idx) in messages" :key="idx">

          <!-- Assistant -->
          <div v-if="msg.role === 'assistant'" class="flex gap-4 animate-slide-up">
            <div class="w-10 h-10 rounded-none bg-psf-green-900 flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-5 h-5 text-psf-lime-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              </svg>
            </div>
            <div class="max-w-[85%]">
              <div class="bg-white border border-psf-green-900/10 px-6 py-4 text-psf-green-900 text-base leading-relaxed" v-html="formatMessage(msg.content)"></div>
              <!-- Quick reply buttons -->
              <div v-if="msg.quickReplies && idx === messages.length - 1" class="flex gap-2 mt-4 flex-wrap">
                <button
                  v-for="r in msg.quickReplies" :key="r"
                  @click="handleQuickReply(r, msg)"
                  class="button button--ghost border-psf-green-900 hover:bg-psf-green-900 hover:text-psf-cream-100"
                >{{ r }}</button>
              </div>
              <span class="text-xs text-psf-green-900/40 mt-2 ml-1 font-mono uppercase">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- User -->
          <div v-else class="flex gap-4 justify-end animate-slide-up">
            <div class="max-w-[85%]">
              <div class="bg-psf-lime-300 border border-psf-green-900 px-6 py-4 text-psf-green-900 text-base leading-relaxed font-medium">{{ msg.content }}</div>
              <span class="text-xs text-psf-green-900/40 mt-2 mr-1 text-right block font-mono uppercase">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- Devis card -->
          <div v-if="msg.devis" class="animate-slide-up my-8">
            <DevisCard :devis="msg.devis" @accept="acceptDevis(msg.devis)" @refuse="refuseDevis()" />
          </div>
        </template>

        <!-- Typing -->
        <div v-if="isTyping" class="flex gap-4 animate-fade-in">
          <div class="w-10 h-10 rounded-none bg-psf-green-900 flex items-center justify-center flex-shrink-0 mt-1">
            <svg class="w-5 h-5 text-psf-lime-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
            </svg>
          </div>
          <div class="bg-white border border-psf-green-900/10 px-6 py-5">
            <div class="flex gap-2 items-center">
              <span class="typing-dot w-2 h-2 bg-psf-green-900 inline-block"></span>
              <span class="typing-dot w-2 h-2 bg-psf-green-900 inline-block"></span>
              <span class="typing-dot w-2 h-2 bg-psf-green-900 inline-block"></span>
            </div>
          </div>
        </div>

        <div ref="bottomAnchor"></div>
      </div>
    </div>

    <!-- Input bar -->
    <div class="border-t border-psf-green-900/20 bg-psf-cream-100 px-4 py-6">
      <div class="max-w-3xl mx-auto">
        <form @submit.prevent="handleSend" class="flex gap-4 items-end relative">
          <div class="flex-1">
            <textarea
              ref="inputRef"
              v-model="inputText"
              placeholder="VOTRE MESSAGE..."
              rows="1"
              @keydown.enter.exact.prevent="handleSend"
              @input="autoResize"
              class="w-full resize-none bg-white border border-psf-green-900 px-6 py-4 text-base text-psf-green-900 placeholder-psf-green-900/40 outline-none focus:border-psf-lime-300 focus:ring-1 focus:ring-psf-lime-300 transition-all duration-150 leading-relaxed max-h-32 overflow-y-auto uppercase font-body font-semibold tracking-wide"
              :disabled="isTyping"
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="!inputText.trim() || isTyping"
            class="flex-shrink-0 w-14 h-14 bg-psf-green-900 flex items-center justify-center text-psf-lime-300 hover:bg-psf-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'chat' })

const { isLoggedIn, init } = useAuth()
onMounted(() => {
  init()
  if (!isLoggedIn.value) {
    navigateTo('/register')
  }
})

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  devis?: DevisData | null
  quickReplies?: string[]
}

interface DevisData {
  reference: string
  trajet: string
  dateDepart: string
  passagers: number
  typeVehicule: string
  prixHT: number
  tva: number
  prixTTC: number
  duree: string
  options: string[]
  validiteDevis: string
}

// ─── State ───────────────────────────────────────────
const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const bottomAnchor = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const sessionId = ref('session-' + Date.now())

const suggestions = [
  'Paris → Lyon',
  'Paris → Bordeaux',
  'Lyon → Marseille'
]

// ─── Actions ──────────────────────────────────────────
async function sendMessage(text: string) {
  const userMsg = text.trim()
  if (!userMsg) return

  messages.value.push({ role: 'user', content: userMsg, timestamp: new Date() })
  inputText.value = ''
  if (inputRef.value) inputRef.value.style.height = 'auto'

  await nextTick()
  scrollToBottom()

  isTyping.value = true

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg, sessionId: sessionId.value, userEmail: userEmail.value })
    })
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }
    
    const data = await res.json() as { reply: string; devis?: any; quickReplies?: string[] }

    messages.value.push({
      role: 'assistant',
      content: data.reply,
      timestamp: new Date(),
      devis: data.devis,
      quickReplies: data.quickReplies
    })
  } catch {
    messages.value.push({
      role: 'assistant',
      content: 'Je suis temporairement indisponible. Vérifiez que n8n est bien lancé et que le workflow est activé.',
      timestamp: new Date(),
      devis: null
    })
  }

  isTyping.value = false

  await nextTick()
  scrollToBottom()
}

function handleSend() { sendMessage(inputText.value) }

function scrollToBottom() {
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

function autoResize(e: Event) {
  const t = e.target as HTMLTextAreaElement
  t.style.height = 'auto'
  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatMessage(content: string) {
  return content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

function acceptDevis(devis: DevisData | null | undefined) {
  if (!devis) return
  window.location.assign(`/devis?ref=${devis.reference}`)
}

function refuseDevis() {
  messages.value.push({
    role: 'assistant',
    content: 'Pas de problème ! Dites-moi votre nouveau trajet et je recalcule.',
    timestamp: new Date()
  })
  nextTick(() => scrollToBottom())
}

function handleQuickReply(replyText: string, msg: Message) {
  if (replyText === 'Valider ce devis') {
    acceptDevis(msg.devis)
  } else if (replyText.toLowerCase().includes('modifier')) {
    messages.value = []
    sessionId.value = 'session-' + Date.now()
  } else {
    sendMessage(replyText)
  }
}
</script>