module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    {
      src: '~plugins/persistedstate.js',
      ssr: false
    }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',

    // With options
    [
      '@nuxtjs/vuetify',
      {
        /* module options */
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa'],
  /*
   ** Build configuration
   */
  build: {
    vendor: ['socket.io-client'],

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
}
