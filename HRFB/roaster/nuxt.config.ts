export default defineNuxtConfig({
  ssr: true,

  runtimeConfig: {
    public: {
      serverUrl: process.env.SERVER_URL || 'http://localhost:5011'
    }
  },

  modules: ['@nuxt/image', '@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  }
})
