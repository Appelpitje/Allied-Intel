export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const { game, ip, port } = query

  if (!game || !ip || !port) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing parameters (game, ip, port)',
    })
  }

  try {
    const response = await $fetch(`https://master.333networks.com/json/${game}/${ip}:${port}`)
    return response
  } catch (error) {
    console.error('333networks details proxy error:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch server details',
    })
  }
}, {
  maxAge: 450, // 7.5 minutes
  name: '333networks-details',
  getKey: (event) => {
    const q = getQuery(event)
    return `${q.game}-${q.ip}-${q.port}`
  },
})
