export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Zero to Hero Education',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      // { name: 'referrer', content: 'no-referrer'}, // Turned off because some youtube videos will not load.
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/icons/favicon.ico' },
      { rel: 'stylesheet', href: '/vendor/fontawesome/css/all.min.css' },
      { rel: "stylesheet", href: "/vendor/css-spinners/spinner/heartbeat.css" }
    ],
    script: [
      { hid: 'russian-legacy', src: '/js/russian-legacy.js', defer: true },
      { hid: 'papaparse', src: '/vendor/papaparse/papaparse.min.js', defer: true },
      { hid: 'jquery', src: '/vendor/jquery/jquery.min.js', defer: true },
      { hid: 'axios', src: '/vendor/axios/axios.min.js', defer: true },
      { hid: 'underscore', src: '/vendor/underscore/underscore.js', defer: true },
      { hid: 'kyujitai', src: '/vendor/kyujitai/kyujitai.js' },
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'css-percentage-circle',
    'video.js/dist/video-js.css'
  ],

  router: {
    middleware: [
      'language-switch',
    ]
  },

  vue: {
    config: {
      runtimeCompiler: true
    }
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    ['@nuxtjs/router-extras', { /* module options */ }],
    '@nuxtjs/pwa'
  ],

  pwa: {
    manifest: {
      name: 'Zero to Hero Education',
      short_name: 'Zero to Hero',
      description: 'Language education done right.',
      theme_color: '#fd4f1c',
      useWebmanifestExtension: false
    },
    workbox: {
      runtimeCaching: [{
        urlPattern: 'http://server.chinesezerotohero.com/.*',
        handler: 'CacheFirst',
        options: {
          cacheName: 'dictionaries',
          expiration: {
            maxEntries: 10,
          },
        },
      }],
    }
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'nuxt-i18n',
    ['nuxt-lazy-load', {
      defaultImage: '/img/placeholder.jpg'
    }]
  ],
  bootstrapVue: {
    components: ['BFormInput', 'BFormGroup', 'BFormSelect', 'BFormTextarea', 'BFormSelectOption', 'BButton', 'BProgress', 'BTable', 
    'BDropdown', 'BDropdownItem', 'BFormCheckbox', 'BFormRadio', 'BButtonGroup', 'BInputGroup', 'BInputGroupAppend', 'BInputGroupText', 'BDropdownDivider'],
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/main.js',
    { src: '~plugins/nuxt-video-player-plugin.js', ssr: false }
  ],

  build: {
    extend(config, { isDev, isClient }) {
      config.resolve.alias['vue'] = 'vue/dist/vue.common'
      // Extend only webpack config for client-bundle
      if (isDev && isClient) {
        config.devtool = '#source-map'
      } else {
        config.devtool = false
      }


      // if (isClient) {
      //   config.node = {
      //     fs: 'empty',
      //     child_process: 'empty',
      //     canva: 'empty',
      //   }
      // }
    }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  generate: {
    routes: [
      // '/en/zh/dictionary/hsk-cedict/%E7%95%99%E5%B0%BE%E5%B7%B4,li%C3%BA_w%C4%9Bi_ba,0',
      // '/en/zh/dictionary/hsk-cedict/%E5%8D%81%E6%88%92,sh%C3%AD_ji%C3%A8,0',
      // '/en/zh/dictionary/hsk-cedict/%E9%9B%95%E5%88%BB,di%C4%81o_k%C3%A8,0'
    ]
  }
}
