import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import ViewUI from 'view-design'

import App from './App.vue'
import router from './router'
import store from './store'

import 'assets/reset.less'
import './theme/iview.less'
// import axios from 'lib/axios'
import EventBus from 'lib/event-bus.js'
import AxiosApi from 'api'
// 国际化
import i18n from './locale'
// sync
sync(store, router)

// Vue.prototype.$http = axios
Vue.use(EventBus)
Vue.use(ViewUI, {
  i18n: (key, value) => i18n.t(key, value)
})

Vue.prototype.$axios = AxiosApi
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
