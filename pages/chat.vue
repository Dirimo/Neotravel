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
              :placeholder="inputPlaceholder"
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

interface Collected {
  trajet: string
  distanceKm: number
  passagers: number
  typeTransfert: 'aller_simple' | 'aller_retour' | null
  date: string
}

// ─── State ───────────────────────────────────────────
const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const bottomAnchor = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const step = ref(0)

const collected = ref<Collected>({
  trajet: '', distanceKm: 0, passagers: 0, typeTransfert: null, date: ''
})

const suggestions = [
  'Paris → Lyon',
  'Paris → Bordeaux',
  'Lyon → Marseille'
]

<<<<<<< HEAD
const sessionId = ref('session-' + Date.now())
const pendingDevis = ref<DevisData | null>(null)

=======
const inputPlaceholders: Record<number, string> = {
  0: 'Ex : Paris → Lyon…',
  1: 'Ex : 45 personnes…',
  2: 'Aller simple ou aller-retour…',
  3: 'Ex : 14 mai 2025…',
}
const inputPlaceholder = computed(() => inputPlaceholders[step.value] ?? 'Écrivez votre réponse…')

// ─── Distance helper ──────────────────────────────────
function estimerDistanceKm(trajet: string): number {
  const t = trajet.toLowerCase()
  const routes: [string[], string[], number][] = [
    [['paris'], ['lyon'], 465],
    [['paris'], ['bordeaux'], 584],
    [['paris'], ['marseille'], 776],
    [['paris'], ['nice'], 930],
    [['paris'], ['strasbourg'], 490],
    [['paris'], ['lille'], 225],
    [['paris'], ['nantes'], 385],
    [['paris'], ['toulouse'], 680],
    [['paris'], ['rennes'], 350],
    [['lyon'], ['marseille'], 315],
    [['lyon'], ['nice'], 470],
    [['lyon'], ['bordeaux'], 555],
    [['bordeaux'], ['biarritz'], 190],
    [['marseille'], ['nice'], 200],
  ]
  for (const [from, to, km] of routes) {
    if (from.some(f => t.includes(f)) && to.some(d => t.includes(d))) return km
    if (to.some(f => t.includes(f)) && from.some(d => t.includes(d))) return km
  }
  return 300
}

// ─── Vehicle helper ───────────────────────────────────
function vehiculePourPassagers(n: number): string {
  if (n <= 19) return 'Minibus 19 places'
  if (n <= 53) return 'Autocar 53 places'
  if (n <= 63) return 'Autocar Grand Tourisme 63 places'
  return 'Autocar Grande Capacité 85 places'
}

// ─── Devis calculator ─────────────────────────────────
function calculerDevis(): DevisData {
  const { trajet, distanceKm, passagers, typeTransfert, date } = collected.value

  // Base tarifaire : distance × coût/km selon capacité
  let base = distanceKm * (passagers <= 19 ? 1.8 : passagers <= 53 ? 2.2 : passagers <= 63 ? 2.8 : 3.5)

  // Aller-retour
  if (typeTransfert === 'aller_retour') base *= 1.85

  // Saisonnalité (mois extrait de la date)
  const moisMap: Record<string, number> = {
    janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12
  }
  const dateLow = date.toLowerCase()
  const moisNum = Object.entries(moisMap).find(([m]) => dateLow.includes(m))?.[1] ?? new Date().getMonth() + 1
  const saisonnalite = [6, 7, 8, 12].includes(moisNum) ? 1.10 : [4, 5, 9, 10].includes(moisNum) ? 1.00 : 0.93
  base *= saisonnalite

  // Marge 15%
  const prixHT = Math.round(base * 1.15)
  const tva = Math.round(prixHT * 0.10)
  const prixTTC = prixHT + tva

  // Durée estimée
  const heures = Math.round(distanceKm / 80)
  const minutes = Math.round((distanceKm / 80 - heures) * 60)
  const duree = `${heures}h${minutes > 0 ? String(minutes).padStart(2, '0') : ''}`

  return {
    reference: 'NEO-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    trajet,
    dateDepart: date,
    passagers,
    typeVehicule: vehiculePourPassagers(passagers),
    prixHT,
    tva,
    prixTTC,
    duree,
    options: [],
    validiteDevis: '72 heures'
  }
}

// ─── Conversation steps ───────────────────────────────
function repondreBotStep(userMsg: string): Message {
  const now = new Date()

  if (step.value === 0) {
    // Trajet
    collected.value.trajet = userMsg
    collected.value.distanceKm = estimerDistanceKm(userMsg)
    step.value = 1
    return {
      role: 'assistant',
      content: `Parfait ! J'ai noté votre trajet **${userMsg}**, soit environ **${collected.value.distanceKm} km**.\n\nCombien de passagers seront dans votre groupe ?`,
      timestamp: now
    }
  }

  if (step.value === 1) {
    // Passagers
    const n = parseInt(userMsg.replace(/\D/g, ''), 10)
    collected.value.passagers = isNaN(n) ? 30 : n
    step.value = 2
    return {
      role: 'assistant',
      content: `**${collected.value.passagers} passagers** — je prévois un **${vehiculePourPassagers(collected.value.passagers)}**.\n\nS'agit-il d'un aller simple ou d'un aller-retour ?`,
      timestamp: now,
      quickReplies: ['Aller simple', 'Aller-retour']
    }
  }

  if (step.value === 2) {
    // Type de transfert
    const isAR = userMsg.toLowerCase().includes('retour') || userMsg.toLowerCase().includes('ar')
    collected.value.typeTransfert = isAR ? 'aller_retour' : 'aller_simple'
    step.value = 3
    return {
      role: 'assistant',
      content: `${isAR ? 'Aller-retour noté ✓' : 'Aller simple noté ✓'}\n\nQuelle est la **date de départ** souhaitée ? (ex : 14 mai 2025)`,
      timestamp: now
    }
  }

  if (step.value === 3) {
    // Date → génération devis
    collected.value.date = userMsg
    step.value = 4
    const devis = calculerDevis()
    return {
      role: 'assistant',
      content: `Voici votre devis personnalisé 👇`,
      timestamp: now,
      devis
    }
  }

  // Après le devis
  return {
    role: 'assistant',
    content: 'Souhaitez-vous modifier un critère ou faire une nouvelle demande ?',
    timestamp: now
  }
}

// ─── Actions ──────────────────────────────────────────
>>>>>>> a312ed1e47213668d0990fd2ae98293b866f1cc2
async function sendMessage(text: string) {
  const userMsg = text.trim()
  if (!userMsg) return

  messages.value.push({ role: 'user', content: userMsg, timestamp: new Date() })
  inputText.value = ''
  if (inputRef.value) inputRef.value.style.height = 'auto'

  await nextTick()
  scrollToBottom()

  isTyping.value = true
<<<<<<< HEAD

  try {
    const data = await $fetch<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: { message: userMsg, sessionId: sessionId.value }
    })

    messages.value.push({
      role: 'assistant',
      content: data.reply,
      timestamp: new Date(),
      devis: null
    })
  } catch {
    messages.value.push({
      role: 'assistant',
      content: "Je suis temporairement indisponible. Vérifiez que n8n est bien lancé (`n8n start`) et que le workflow est en mode test.",
      timestamp: new Date(),
      devis: null
    })
  }

=======
  await delay(900 + Math.random() * 500)

  const response = repondreBotStep(userMsg)
  messages.value.push(response)
>>>>>>> a312ed1e47213668d0990fd2ae98293b866f1cc2
  isTyping.value = false

  await nextTick()
  scrollToBottom()
}

function handleSend() { sendMessage(inputText.value) }

<<<<<<< HEAD
function scrollToBottom() {
  bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

=======
function scrollToBottom() { bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' }) }
function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }
>>>>>>> a312ed1e47213668d0990fd2ae98293b866f1cc2

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
  navigateTo({ path: '/devis', query: { ref: devis.reference } })
}

function refuseDevis() {
  step.value = 0
  collected.value = { trajet: '', distanceKm: 0, passagers: 0, typeTransfert: null, date: '' }
  messages.value.push({
    role: 'assistant',
    content: 'Pas de problème ! Dites-moi votre nouveau trajet et je recalcule.',
    timestamp: new Date()
  })
  nextTick(() => scrollToBottom())
}
</script>
