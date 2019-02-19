import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import store from './store/store'
// import { sync } from 'vuex-router-sync'
// import VueRouter from 'vue-router'
// import { routes } from './routes'

Vue.config.productionTip = true

/*
Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

sync(store, router)
*/

Vue.use(Vuex)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  // router,
  store,
  render: h => h(App)
})
