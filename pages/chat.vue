<template>
  <div class="h-full flex flex-col">
    <!-- Chat area -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto chat-scroll px-4 py-8">
      <div class="max-w-2xl mx-auto space-y-6">

        <!-- Welcome message -->
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
            Où souhaitez-vous aller&nbsp;? Décrivez-moi votre projet de transport de groupe et je calculerai votre devis en quelques instants.
          </p>

          <!-- Quick suggestions -->
          <div class="flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-600 hover:border-diamond-400 hover:text-diamond-600 hover:bg-diamond-50 transition-all duration-150 text-left"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <template v-for="(msg, idx) in messages" :key="idx">
          <!-- Assistant message -->
          <div v-if="msg.role === 'assistant'" class="flex gap-3 animate-slide-up">
            <div class="w-8 h-8 rounded-full bg-diamond-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              </svg>
            </div>
            <div class="max-w-[80%]">
              <div class="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-3.5 text-gray-700 text-sm leading-relaxed" v-html="formatMessage(msg.content)"></div>
              <span class="text-xs text-gray-300 mt-1 ml-1">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- User message -->
          <div v-else class="flex gap-3 justify-end animate-slide-up">
            <div class="max-w-[80%]">
              <div class="bg-diamond-500 rounded-2xl rounded-tr-sm px-5 py-3.5 text-white text-sm leading-relaxed">
                {{ msg.content }}
              </div>
              <span class="text-xs text-gray-300 mt-1 mr-1 text-right block">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>

          <!-- Devis card inline -->
          <div v-if="msg.devis" class="animate-slide-up">
            <DevisCard :devis="msg.devis" @accept="acceptDevis(msg.devis)" @refuse="refuseDevis()" />
          </div>
        </template>

        <!-- Typing indicator -->
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
          <div class="flex-1 relative">
            <textarea
              ref="inputRef"
              v-model="inputText"
              placeholder="Écrivez votre réponse ici..."
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
        <p class="text-xs text-gray-300 mt-2 text-center">Appuyez sur Entrée pour envoyer · Maj+Entrée pour un saut de ligne</p>
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

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const bottomAnchor = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const suggestions = [
  'Paris → Lyon, 45 personnes',
  'Transfert aéroport CDG, 20 personnes',
  'Sortie scolaire Bordeaux → Biarritz'
]

// Simulated conversation state
const conversationStep = ref(0)
const pendingDevis = ref<DevisData | null>(null)

const botResponses = [
  // Step 0 — ask for date
  (userMsg: string) => ({
    content: `Parfait ! J'ai bien noté votre demande : **${userMsg}**.\n\nPour calculer votre devis, j'ai besoin de quelques informations supplémentaires.\n\n📅 Quelle est la **date de départ** souhaitée ?`,
    devis: null
  }),
  // Step 1 — ask for options
  (_: string) => ({
    content: `Merci ! Avez-vous besoin d'options particulières ?\n\n• 🎤 Guide à bord (+80€/jour)\n• 🌙 Nuit chauffeur sur place (+120€/nuit)\n• Aucune option\n\nRépondez par exemple : *"Guide et nuit chauffeur"* ou *"Aucune option"*.`,
    devis: null
  }),
  // Step 2 — generate devis
  (_: string) => {
    const devis: DevisData = {
      reference: 'NEO-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      trajet: messages.value[0]?.content || 'Paris → Lyon',
      dateDepart: '15 juillet 2025',
      passagers: 48,
      typeVehicule: 'Autocar 53 places',
      prixHT: 1840,
      tva: 184,
      prixTTC: 2024,
      duree: '4h30',
      options: ['Guide à bord'],
      validiteDevis: '72 heures'
    }
    pendingDevis.value = devis
    return {
      content: `Excellent ! J'ai calculé votre devis. Voici le récapitulatif ci-dessous 👇`,
      devis
    }
  }
]

async function sendMessage(text: string) {
  const userMsg = text.trim()
  if (!userMsg) return

  messages.value.push({ role: 'user', content: userMsg, timestamp: new Date() })
  inputText.value = ''
  if (inputRef.value) inputRef.value.style.height = 'auto'

  await nextTick()
  scrollToBottom()

  isTyping.value = true
  await delay(1200 + Math.random() * 600)

  const stepIdx = Math.min(conversationStep.value, botResponses.length - 1)
  const response = botResponses[stepIdx](userMsg)

  messages.value.push({
    role: 'assistant',
    content: response.content,
    timestamp: new Date(),
    devis: response.devis
  })

  conversationStep.value++
  isTyping.value = false

  await nextTick()
  scrollToBottom()
}

function handleSend() {
  sendMessage(inputText.value)
}

function scrollToBottom() {
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function autoResize(e: Event) {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 128) + 'px'
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
  navigateTo({ path: '/devis', query: { ref: devis.reference } })
}

function refuseDevis() {
  messages.value.push({
    role: 'assistant',
    content: 'Pas de problème ! Souhaitez-vous modifier certains critères ou explorer une autre option ? Je suis là pour vous aider.',
    timestamp: new Date()
  })
  conversationStep.value = 0
  nextTick(() => scrollToBottom())
}
</script>
