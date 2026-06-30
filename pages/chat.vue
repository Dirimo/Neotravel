<template>
  <div class="h-full flex flex-col">
    <!-- Chat area -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto chat-scroll px-4 py-8">
      <div class="max-w-2xl mx-auto space-y-6">

        <!-- Welcome -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
          <div class="w-16 h-16 rounded-2xl bg-diamond-500 flex items-center justify-center shadow-lg mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">
            Bonjour&nbsp;! Je suis Neotravel,<br class="hidden sm:block"> votre assistant personnel.
          </h2>
          <p class="text-gray-500 mb-8 max-w-md">
            Décrivez-moi votre trajet et je calculerai votre devis en quelques instants.
          </p>
          <div class="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <button
              v-for="s in suggestions" :key="s"
              @click="sendMessage(s)"
              class="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 hover:border-diamond-400 hover:text-diamond-600 hover:bg-diamond-50 transition-all duration-150 text-left"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Messages -->
        <template v-for="(msg, idx) in messages" :key="idx">

          <!-- Assistant -->
          <div v-if="msg.role === 'assistant'" class="flex gap-3 animate-slide-up">
            <div class="w-8 h-8 rounded-full bg-diamond-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              </svg>
            </div>
            <div class="max-w-[80%]">
              <div class="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-3.5 text-gray-700 text-sm leading-relaxed" v-html="formatMessage(msg.content)"></div>
              <!-- Quick reply buttons -->
              <div v-if="msg.quickReplies && idx === messages.length - 1" class="flex gap-2 mt-3 flex-wrap">
                <button
                  v-for="r in msg.quickReplies" :key="r"
                  @click="sendMessage(r)"
                  class="text-sm border border-diamond-300 text-diamond-600 bg-white rounded-full px-4 py-1.5 hover:bg-diamond-50 hover:border-diamond-400 transition-all duration-150 font-medium"
                >{{ r }}</button>
              </div>
              <span class="text-xs text-gray-300 mt-1 ml-1">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- User -->
          <div v-else class="flex gap-3 justify-end animate-slide-up">
            <div class="max-w-[80%]">
              <div class="bg-diamond-500 rounded-2xl rounded-tr-sm px-5 py-3.5 text-white text-sm leading-relaxed">{{ msg.content }}</div>
              <span class="text-xs text-gray-300 mt-1 mr-1 text-right block">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>

          <!-- Devis card -->
          <div v-if="msg.devis" class="animate-slide-up">
            <DevisCard :devis="msg.devis" @accept="acceptDevis(msg.devis)" @refuse="refuseDevis()" />
          </div>
        </template>

        <!-- Typing -->
        <div v-if="isTyping" class="flex gap-3 animate-fade-in">
          <div class="w-8 h-8 rounded-full bg-diamond-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
            <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
            </svg>
          </div>
          <div class="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4">
            <div class="flex gap-1.5 items-center">
              <span class="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
              <span class="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
              <span class="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
            </div>
          </div>
        </div>

        <div ref="bottomAnchor"></div>
      </div>
    </div>

    <!-- Input bar -->
    <div class="border-t border-gray-100 bg-white px-4 py-4">
      <div class="max-w-2xl mx-auto">
        <form @submit.prevent="handleSend" class="flex gap-3 items-end">
          <div class="flex-1">
            <textarea
              ref="inputRef"
              v-model="inputText"
              placeholder="Décrivez votre transfert en autocar..."
              rows="1"
              @keydown.enter.exact.prevent="handleSend"
              @input="autoResize"
              class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-diamond-400 focus:ring-2 focus:ring-diamond-100 transition-all duration-150 leading-relaxed max-h-32 overflow-y-auto"
              :disabled="isTyping"
            ></textarea>
          </div>
          <button
            type="submit"
            :disabled="!inputText.trim() || isTyping"
            class="flex-shrink-0 w-11 h-11 rounded-xl bg-diamond-500 flex items-center justify-center text-white hover:bg-diamond-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-md"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </form>
        <p class="text-xs text-gray-300 mt-2 text-center">Entrée pour envoyer · Maj+Entrée pour un saut de ligne</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'chat' })

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
      body: JSON.stringify({ message: userMsg, sessionId: sessionId.value })
    })
    const data = await res.json() as { reply: string }

    messages.value.push({
      role: 'assistant',
      content: data.reply,
      timestamp: new Date(),
      devis: null
    })
  } catch {
    messages.value.push({
      role: 'assistant',
      content: 'Je suis temporairement indisponible. Vérifiez que n8n est bien lancé et que le workflow est en mode test.',
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
</script>