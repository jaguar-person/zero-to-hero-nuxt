import Helper from '@/lib/helper'
import Config from '@/lib/config'

export const state = () => {
  return {
    item: [],
    loaded: false
  }
}
export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let item
      try {
        item = JSON.parse(json)
      } catch (err) {
        Helper.logError(err)
      }
      if (item) {
        state.items = item
        localStorage.setItem('zthBookshelf', JSON.stringify(state.items))
      }
      state.loaded = true
    }
  },
  LOAD(state) {
    if (typeof localStorage !== 'undefined') {
      let items = JSON.parse(localStorage.getItem('zthBookshelf') || '[]')
      items = Helper.uniqueByValue(items, 'id')
      state.items = items || state.items
      state.loaded = true
    }
  },
  ADD(state, itemData) {
    if (typeof localStorage !== 'undefined') {
      let prevVersionOfSameItemIndex = state.items.findIndex(i => i.id === itemData.id)
      if (prevVersionOfSameItemIndex !== -1)
        state.items[prevVersionOfSameItemIndex] = itemData
      else state.items.push(itemData)
      localStorage.setItem('zthBookshelf', JSON.stringify(state.items))
      this._vm.$set(state, 'items', state.items)
    }
  },
  REMOVE(state, itemData) {
    if (typeof localStorage !== 'undefined' && state.items) {
      const keepers = state.items.filter(
        item => item.id !== itemData.id
      )
      localStorage.setItem('zthBookshelf', JSON.stringify(keepers))
      this._vm.$set(state, 'items', keepers)
    }
  },
  REMOVE_ALL(state) {
    if (typeof localStorage !== 'undefined' && state.items) {
      let item = [].concat(state.items)
      item = []
      localStorage.setItem('zthBookshelf', JSON.stringify(item))
      this._vm.$set(state, 'items', item)
    }
  }
}
export const actions = {
  load({ commit }) {
    if (!state.loaded) commit('LOAD')
  },
  add({ commit, dispatch }, itemData) {
    if (!state.loaded) {
      dispatch('load')
    }
    commit('ADD', Object.assign({}, itemData))
    dispatch('push')
  },
  remove({ commit, dispatch }, itemData) {
    commit('REMOVE', Object.assign({}, itemData))
    dispatch('push')
  },
  removeAll({ commit, dispatch }) {
    commit('REMOVE_ALL')
    dispatch('push')
  },
  async importFromJSON({ commit }, json) {
    commit('IMPORT_FROM_JSON', json)
  },
  async push({ rootState }) {
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      let payload = { bookshelf: localStorage.getItem('zthBookshelf') }
      let url = `${Config.wiki}items/user_data/${dataId}?fields=id`
      await this.$authios.patch(url, payload)
        .catch(async (err) => {
          console.log('Axios error in item.js: err, url, payload', err, url, payload)
        })
    }
  }
}
export const getters = {
  has: state => itemData => {
    if (state.items) {
      let hasitemData = false
      hasitemData = state.items.find(
        item => item.id && item.id === itemData.id
      )
      return hasitemData
    }
  },
  count: state => () => {
    if (state.items) {
      return state.items.length
    } else {
      return 0
    }
  }
}

