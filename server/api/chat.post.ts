export default defineEventHandler(async (event) => {
  const body = await readBody<{ message: string; sessionId: string; userEmail?: string }>(event)

  const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/neotravel-chat-webhook-001/chat'

  const response = await fetch(n8nUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sendMessage',
      sessionId: body.sessionId,
      chatInput: body.message,
      userEmail: body.userEmail
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `n8n error: ${response.statusText}`
    })
  }

  const textResponse = await response.text()
  
  if (!textResponse) {
    return { reply: 'Erreur: n8n a retourné une réponse vide (vérifiez les erreurs dans l\'exécution n8n).' }
  }

  try {
    let data = JSON.parse(textResponse)
    // If n8n returns an array (default Webhook behavior), get the first item
    if (Array.isArray(data)) {
      data = data[0]
    }
    
    const reply = data?.output ?? data?.text ?? data?.message ?? 'Aucune réponse reçue du modèle.'
    
    let devis = null
    let quickReplies = undefined

    if (reply.includes('Voici votre devis') || reply.includes('Prix TTC')) {
      const prixHTMatch = reply.match(/Prix HT\s*:\s*([\d\s,.]+)\s*€/i)
      const prixTTCMatch = reply.match(/Prix TTC\s*:\s*([\d\s,.]+)\s*€/i)
      const tvaMatch = reply.match(/TVA.*:\s*([\d\s,.]+)\s*€/i)
      
      const trajetMatch = reply.match(/Transfert (.+?) [-—–] (.+?) km/i)
      const passagersMatch = reply.match(/[-—–] (\d+) passagers/i)
      const dateMatch = reply.match(/Départ\s*:\s*(.+)/i)
      
      if (prixTTCMatch) {
        const distance = trajetMatch ? parseFloat(trajetMatch[2]) : 0;
        devis = {
          reference: 'DEV-' + Math.floor(1000 + Math.random() * 9000),
          trajet: trajetMatch ? `Transfert ${trajetMatch[1]} — ${trajetMatch[2]} km` : 'Trajet sur mesure',
          dateDepart: dateMatch ? dateMatch[1].trim() : 'Non spécifiée',
          passagers: passagersMatch ? parseInt(passagersMatch[1]) : 0,
          typeVehicule: 'Autocar Tourisme',
          duree: distance > 0 ? `${Math.max(1, Math.round(distance / 75))}h` : '—',
          prixHT: parseFloat((prixHTMatch?.[1] || '0').replace(/\s/g, '').replace(',', '.')),
          tva: parseFloat((tvaMatch?.[1] || '0').replace(/\s/g, '').replace(',', '.')),
          prixTTC: parseFloat(prixTTCMatch[1].replace(/\s/g, '').replace(',', '.'))
        }
        quickReplies = ["Valider ce devis", "Modifier la demande"]
      }
    }

    return { reply, devis, quickReplies }
  } catch (err) {
    console.error("Erreur de parsing JSON depuis n8n:", textResponse)
    return { reply: `Erreur interne n8n: ${textResponse.substring(0, 50)}...` }
  }
})
