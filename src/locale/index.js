/**
 * 引入vue-i18n
 */
import Vue from 'vue'
import VueI18n from 'vue-i18n'
/**
 * 导入自定义 语言包
 */
import customZhCn from './lang/zh-CN'
import customEnUs from './lang/en-US'
import customID from './lang/id-ID'
/**
 * 导入iview自带语言包
 */
import zhCnLocale from 'view-design/dist/locale/zh-CN'
import enUsLocale from 'view-design/dist/locale/en-US'
import idIDLocale from 'view-design/dist/locale/id-ID'
Vue.use(VueI18n) // 越南文

// 自动根据浏览器系统语言设置语言
// const navLang = navigator.language
// const localLang = (navLang === 'zh-CN' || navLang === 'en-US') ? navLang : false
// let lang = localLang || localRead('local') || 'zh-CN'

/**
 * localStorage.getItem(key):获取指定key本地存储的值
 * localStorage.setItem(key,value)：将value存储到key字段
 * localStorage.removeItem(key):删除指定key本地存储的值
 */
let DEFAULT_LANG = localStorage.getItem('language') || 'id'

Vue.config.lang = DEFAULT_LANG

// vue-i18n 6.x+写法
Vue.locale = () => {}
/**
 * 多语言配置
 * Object.assign(zh,app_zh)
 * zh       : iview 语言包
 * app_zh   : 自动以语言包
 */
const messages = {
  zh: Object.assign(zhCnLocale, customZhCn),
  en: Object.assign(enUsLocale, customEnUs),
  id: Object.assign(idIDLocale, customID)
}
const i18n = new VueI18n({
  locale: DEFAULT_LANG,
  fallbackLocale: 'id', // 默认语言设置，当其他语言没有的情况下，使用id作为默认语言
  messages,
  locales: ['id', 'en', 'zh'] // 支持的语言列表
})

export default i18n
