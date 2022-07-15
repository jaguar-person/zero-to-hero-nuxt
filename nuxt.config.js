export default {
  env: {
    baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  },
  // server: {
  //   host: '0.0.0.0' // default: 'localhost'
  // },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Language Player',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      // { name: 'referrer', content: 'no-referrer'}, // Turned off because some youtube videos will not load.
      { name: 'viewport', content: 'viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      { name: "apple-itunes-app", content: "app-id=1623985525" }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/icons/favicon.ico' },
      { rel: 'stylesheet', href: '/vendor/fontawesome-pro-6.1.1-web/css/all.min.css' },
      { rel: 'stylesheet', href: '/fonts/fonts.css' },
      { rel: 'stylesheet', href: '/vendor/octicons/octicons.css' }
    ],
    script: [
      { hid: 'russian-legacy', src: '/js/russian-legacy.js', defer: true },
      { hid: 'papaparse', src: '/vendor/papaparse/papaparse.min.js', defer: true },
      { hid: 'jquery', src: '/vendor/jquery/jquery.min.js', defer: true },
      { hid: 'axios', src: '/vendor/axios/axios.min.js', defer: true },
      { hid: 'underscore', src: '/vendor/underscore/underscore.js', defer: true },
      { hid: 'hls', src: 'https://cdn.jsdelivr.net/npm/hls.js@latest', defer: true }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'css-percentage-circle',
    'video.js/dist/video-js.css',
    '@/assets/css/zerotohero.scss',
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
  components: {
    dirs: [
      '~/components',
      // '~/components/jw' // Auto-import components in the sub dir while maintaining their names
    ]
  },

  pwa: {
    icon: {
      fileName: 'icon4.png', // Renamed from icon.png in order for the pwa module to regenerate updated icons
      purpose: 'maskable', // So that the user's os will add masking/padding around the icon (rounded corner, circle, etc)
    },
    manifest: {
      name: 'Language Player',
      short_name: 'Language Player',
      description: 'Learn languages with videos.',
      theme_color: '#1d1d1d',
      useWebmanifestExtension: false
    },
    workbox: {
      cacheAssets: [
        '/workers/dict-worker.js',
        '/js/dialect-dict.js',
        '/js/ecdict.js',
        '/js/edict.js',
        '/js/freedict.js',
        '/js/hsk-cedict.js',
        '/js/kengdic.js',
        '/js/klingonska.js',
        '/js/openrussian.js',
        '/js/russian-legacy.js',
        '/js/wiktionary.js',
      ],
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

  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    'nuxt-i18n',
    '@nuxtjs/google-fonts',
    '@nuxtjs/auth-next',
    '@nuxtjs/toast',

    ['nuxt-lazy-load', {
      // These are the default values
      native: false, // https://caniuse.com/loading-lazy-attr
      directiveOnly: false, 

      // Default image must be in the static folder
      defaultImage: '/img/placeholder-faded.png',
    }]
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    'nuxt-delay-hydration',
    ['@nuxtjs/router-extras', { /* module options */ }],
    '@nuxtjs/pwa'
  ],

  delayHydration: {
    mode: 'manual',
  },

  toast: {
    position: 'top-center'
  },

  auth: {
    redirect: {
      login: false,
      logout: false,
      callback: false,
      home: '/dashboard'
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'data.token',
          global: true,
          maxAge: 60 * 60 * 24 * 30, // Set in Directus settings
          // required: true,
          // type: 'Bearer'
        },
        refreshToken: {
          property: 'data.token',
          data: 'token',
          maxAge: 60 * 60 * 24 * 30
        },
        user: {
          property: 'data.user',
          autoFetch: false
        },
        endpoints: {
          login: { url: 'https://directusvps.zerotohero.ca/zerotohero/auth/authenticate', method: 'post' },
          refresh: { url: 'https://directusvps.zerotohero.ca/zerotohero/auth/refresh', method: 'post' },
          logout: { url: 'https://directusvps.zerotohero.ca/zerotohero/auth/logout', method: 'post' },
          user: false
        }
      }
    }
  },

  bootstrapVue: {
    components: ['BForm', 'BSpinner', 'BCard', 'BFormInput', 'BFormFile', 'BFormGroup', 'BFormSelect', 'BFormTextarea', 'BFormSelectOption', 'BButton', 'BProgress', 'BTable',
      'BDropdown', 'BDropdownItem', 'BFormCheckbox', 'BFormCheckboxGroup', 'BFormRadio', 'BButtonGroup', 'BInputGroup', 'BInputGroupAppend', 'BInputGroupText', 'BDropdownDivider', 'BProgressBar', 'BModal'],
    directives: ['VBModal']
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/main.js',
    // '~plugins/jw.js',
    '~plugins/directus.js',
    '~plugins/subs.js',
    { src: '~plugins/d-player.js', mode: 'client' },
    { src: '~/plugins/stripe.js', mode: 'client' },
    { src: '~/plugins/paypal.js', mode: 'client' },
    { src: '~/plugins/ios-in-app-purchase.js', mode: 'client' },
    // { src: '~/plugins/tui_editor.client.js', mode: 'client' },
    { src: '~/plugins/pwa-update.js', mode: 'client' },
    { src: '~/plugins/vuex-persist.js', mode: 'client' },
    { src: '~/plugins/shared-mutations.js', mode: 'client' },
    { src: '~/plugins/idle-vue.js', mode: 'client' },
  ],

  build: {
    /* Extending webpack config */
    /* https://vue-loader.vuejs.org/guide/css-modules.html */
    loaders: {
      cssModules: {
        modules: true
      }
    },
    extend(config, { isDev, isClient }) {
      config.resolve.alias['vue'] = 'vue/dist/vue.common'
      // Extend only webpack config for client-bundle
      if (isDev && isClient) {
        config.devtool = '#source-map'
      } else {
        config.devtool = false
      }
    },
    transpile: [
      'iframe-translator'
    ]
  },
  target: 'static',
  generate: {
    routes: ['/'],
//     routes: `/
// /en/zh/online-courses
// /dashboard
// /en/zh/tv-shows
// /en/zh/dictionary
// /en/zh/all-media
// /en/zh/learning-path
// /register
// /login
// /en/zh/reader
// /en/zh/saved-words
// /en/zh/settings
// /en/zh/grammar
// /en/zh/profile
// /zh/en/learning-path
// /en/zh/
// /go-pro
// /en/zh/explore/levels
// /en/zh/textbooks-workbooks
// /en/zh/phrasebooks
// /en/zh/explore/new-levels
// /stats
// /zh/en/online-courses
// /en/ja/learning-path
// /en/zh/youtube/search
// /en/zh/show/tv-show/675
// /zh/en/tv-shows
// /register/
// /en/zh/talks
// /en/zh/saved-phrases
// /language-map/
// /en/ja/all-media
// /en/zh/video-count
// /zh/en/all-media
// /en/zh/pricing
// /en/en/all-media
// /en/zh/hall-of-heroes
// /login/
// /logout
// /en/zh/youtube/browse/kids/all
// /zh/en/reader
// /en/ja/tv-shows
// /en/zh/audiobooks
// /en/zh/explore/new-levels-graphic
// /en/fr/learning-path
// /forgot-password
// /en/fr/all-media
// /en/zh/books
// /zh/en/dictionary
// /en/zh/web-reader
// /en/zh/live-tv
// /en/zh/show/tv-show/831
// /en/zh/explore/related/中國,zhōng_guó,0
// /language-icons
// /en/en/learning-path
// /en/es/all-media
// /en/ja/live-tv
// /en/es/learning-path
// /en/zh/library
// /en/zh/characters
// /en/zh/tv-shows/all/2
// /en/zh/minimal-pairs
// /zh/en/resource/list/all/all
// /en/zh/show/tv-show/1939
// /en/cmn/learning-path
// /en/zh/resource/list/all/all
// /dashboard/
// /zh/en/settings
// /en/zh/course-release-schedule
// /sale/
// /en/zh/show/tv-show/142
// /en/zh/dictionary/hsk-cedict
// /en/zh/studysheet
// /en/zh/language-info
// /en/zh/idioms
// /zh/en/resource/list
// /en/tl/resource/list
// /en/de/all-media
// /en/ja/resource/list/all/all
// /en/zh/youtube/history
// /en/ja/reader
// /en/zh/explore/roots
// /zh/en/books
// /en/zh/show/tv-show/6
// /zh/en/live-tv
// /zh/en/profile
// /zh/en/saved-words
// /en/zh/youtube/view
// /en/zh/youtube/view/9pY-MHRkfZo
// /en/de/learning-path
// /en/zh/phrasebook/452
// /en/zh/tv-shows/all
// /en/zh/youtube/view/qIko053otwQ
// /en/ru/learning-path
// /en/zh/tv-shows/all/3
// /en/ja/
// /en/ko/learning-path
// /en/zh/affiliate-program
// /zh/en/phrasebooks
// /zh/en/tutoring`.split("\n"),
    fallback: true,
    crawler: false
  }
}