export default defineEventHandler(async (event) => {
  const body = await readBody<{ message: string; sessionId: string }>(event)

  const n8nUrl = 'http://localhost:5678/webhook-test/neotravel-chat-webhook-001/chat'

  const response = await fetch(n8nUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sendMessage',
      sessionId: body.sessionId,
      chatInput: body.message
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `n8n error: ${response.statusText}`
    })
  }

  const data = await response.json() as { output?: string; text?: string }
  return { reply: data.output ?? data.text ?? 'Aucune réponse reçue.' }
})
