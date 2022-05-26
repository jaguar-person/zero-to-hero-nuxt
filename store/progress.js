import Config from '@/lib/config'

export const state = () => {
  return {
    progress: {}, // Each language has its own progress
    progressLoaded: false
  }
}
export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let progress
      try {
        progress = JSON.parse(json)
      } catch (err) {
        Helper.logError(err)
      }
      if (progress) {
        state.progress = progress
        localStorage.setItem('zthProgress', JSON.stringify(state.progress))
      }
      state.progressLoaded = true
    }
  },
  LOAD(state) {
    if (typeof localStorage !== 'undefined') {
      let progress = JSON.parse(localStorage.getItem('zthProgress') || '{}')
      state.progress = progress || state.progress
      state.progressLoaded = true
    }
  },
  SET_LEVEL(state, { l2, level }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      progress[l2.code].level = level
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
  SET_TIME(state, { l2, time }) {
    console.log(`⏳ Logging time for ${l2.name} (${l2.code}): ${parseInt(time / 1000)} seconds`)
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      progress[l2.code].time = time
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
  ADD_CERTIFICATION(state, { l2, certification }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      if (!progress[l2.code].certifications) progress[l2.code].certifications = []
      progress[l2.code].certifications.push(certification)
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
}
export const actions = {
  load({ commit }) {
    if (!state.progressLoaded) commit('LOAD')
    // Data from the server is loaded via default.vue's initAndGetUserData()
  },
  async importFromJSON({ commit }, json) {
    commit('IMPORT_FROM_JSON', json)
  },
  setLevel({ dispatch, commit }, { l2, level }) {
    commit('SET_LEVEL', { l2, level })
    dispatch('push')
  },
  setTime({ dispatch, commit }, { l2, time }) {
    commit('SET_TIME', { l2, time })
    dispatch('push')
  },
  async push({ commit, state, rootState }) {
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      let payload = { progress: localStorage.getItem('zthProgress') }
      let url = `${Config.wiki}items/user_data/${dataId}?fields=id`
      await this.$authios.patch(url, payload)
        .catch(async (err) => {
          console.log('Axios error in progress.js: err, url, payload', err, url, payload)
        })
    }
  }
}
export const getters = {
  level: state => l2 => {
    if (state.progress[l2.code]) return state.progress[l2.code].level || 1
  },
  time: state => l2 => {
    let time = 0
    if (state.progress[l2.code] && state.progress[l2.code].time) time = state.progress[l2.code].time
    return time
  }
}

