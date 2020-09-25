import _Vue from 'vue'
const EventBus = new _Vue()

export default {
  install(Vue) {
    Vue.prototype.EventBus = EventBus
  }
}
