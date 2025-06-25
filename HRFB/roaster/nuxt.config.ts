import shadcn from 'shadcn-nuxt'


export default defineNuxtConfig({
  ssr: true,

  runtimeConfig: {
    public: {
      serverUrl: process.env.SERVER_URL || 'http://13.49.46.74:5011'
    }
  },

  modules: ['@nuxt/image', '@nuxtjs/tailwindcss',     shadcn ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  }
})
