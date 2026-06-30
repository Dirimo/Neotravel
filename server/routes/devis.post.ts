export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const response = await fetch('http://127.0.0.1:3001/devis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Backend error: ${response.statusText}`
      })
    }

    return await response.json()
  } catch (error: any) {
    console.error("Erreur de proxy vers le moteur de devis:", error)
    return {
      type: "erreur_interne",
      message: "Le moteur de devis n'est pas joignable sur le port 3001."
    }
  }
})
