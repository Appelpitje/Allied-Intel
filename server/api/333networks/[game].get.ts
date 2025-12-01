export default defineCachedEventHandler(async (event) => {
  const game = getRouterParam(event, 'game')
  
  if (!game) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Game parameter is missing',
    })
  }

  try {
    const response = await $fetch(`https://master.333networks.com/json/${game}`)
    return response
  } catch (error) {
    console.error('333networks proxy error:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch from 333networks',
    })
  }
}, {
  maxAge: 450, // 7.5 minutes
  name: '333networks-servers',
  getKey: (event) => event.context.params?.game || 'default',
})
