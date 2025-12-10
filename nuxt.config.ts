// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'development'
        ? 'http://localhost:10000/api'
        : 'https://serverinfo.appelpitje.dev/api'
    }
  }
})
