import Vue from 'vue'
import Vuex from 'vuex'

import editPage from './modules/edit_page'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    editPage
  }
})
