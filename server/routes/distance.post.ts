export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const villeDepart = body?.villeDepart || ''
  const villeArrivee = body?.villeArrivee || ''

  if (!villeDepart || !villeArrivee) {
    return { distanceKm: 100 }
  }

  try {
    const getCoords = async (city: string) => {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', France')}`, {
        headers: { 'User-Agent': 'NeoTravel/1.0' }
      })
      const data = await res.json()
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
      return null
    }

    const coords1 = await getCoords(villeDepart)
    const coords2 = await getCoords(villeArrivee)

    if (coords1 && coords2) {
      // Haversine formula
      const R = 6371
      const dLat = (coords2.lat - coords1.lat) * Math.PI / 180
      const dLon = (coords2.lon - coords1.lon) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      // Approximation for driving distance (+30%)
      return { distanceKm: Math.max(1, Math.round(distance * 1.3)) }
    }
  } catch (e) {
    console.error("Erreur géocodage:", e)
  }

  // Fallback if not found
  return { distanceKm: 500 }
})
