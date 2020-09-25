import qs from 'qs'
import axios from 'axios'
import { Notice } from 'view-design'
// import Router from 'router'

let version = process.env.VUE_APP_VERSION

let cancel = { message: '' }

const ROUTE_CHANGE = 'ROUTE_CHANGE'

/**
 *
 * @param {*} config
 * @description 请求体 控制token或者hender
 * @type {headers}
 * @param {Authorization} 登录以后后续接口所需要的的cookies值也就是token唯一标识符号
 * @param {Accept-Language} 根据本地浏览器的地区设置语言供后端实现语言配置
 * @param {version} 当前新版本上线所需要的版本好，可作用于新功能上线强制刷新页面更新静态资源
 * @type {cancelToken} 作用于多个请求取消重复请求 TODO:// 还有待验证
 */
const requestInterceptor = config => {
  // 不是login页面,验证token
  config.headers = {
    Authorization: localStorage.getItem('token') || '',
    'Accept-Language': window.localStorage.getItem('language') || 'id',
    version: version
  }
  config.cancelToken = new axios.CancelToken(c => (cancel = c))
  return config
}
/**
 *
 * @param {*} res
 * @description 最终数据返回的信息 body响应体
 * @description 具体的code或者status根据具体业务处理返回结果
 */
const responseInterceptor = res => {
  if (res.data.code) {
    const code = res.data.code.toLocaleUpperCase()
    if (code !== 'SUCCESS' && code !== 'UPGRADE_APP' && code !== 'UPGRADE_APP') {
      if (code === 'ERROR' && res.config.url !== '/saas/user/login') {
        // Router.push('/no-network')
      } else {
        Notice.error({
          title: 'Tips',
          desc: `${res.data.message || 'The server is abnormal, please try again later'}`,
          duration: 4
        })
      }
      return Promise.reject(res.data)
    }
  }
  return res.data
}
/**
 *
 * @param {*} err
 * @description 请求接口失败以后做的事情
 * @type {status} 是200代表Http状态成功，否则都抛异常，错误信息提示或者具体业务返回
 */
const errorInterceptor = err => {
  const { response } = err
  if (response) {
    if (response.status !== 200) {
      switch (response.status) {
        case 401: //TODO:资源未加载出来
          window.localStorage.clear()
          window.sessionStorage.clear()
          Notice.error({
            title: 'Tips',
            desc: 'Token kadaluarsa, silahkan refresh laman ini dan coba lagi',
            duration: 10
          })
          return Promise.reject(response.data)
        case 403: // TODO:没权限具体根据业务详细处理
          // Router.push('/no-permission')
          return Promise.reject(response.data)
        default:
          if (response.config.url === '/api/user/login') {
            Notice.error({
              title: 'Tips',
              desc: `${response.data.message || 'The server is abnormal, please try again later'}`,
              duration: 4
            })
          } else {
            // Router.push('/no-network')
          }
          return Promise.reject(response.data)
      }
    }
  }
  // Router.push('/no-network')
  const errorMessage = { name: 'networkError', message: 'The server is abnormal, please try again later' }
  return Promise.reject(errorMessage)
}
/**---------------------------可以处理多个axios的创建实例作用于不同的api服务------------------------ */

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    Authorization: localStorage.getItem('token') || '',
    'Access-Control-Allow-Credentials': false,
    'Accept-Language': window.localStorage.getItem('language') || 'id'
  },
  paramsSerializer: params => {
    return qs.stringify(params)
  }
})

/**
 * Axios instance ignoring error handler
 */
const instanceIgnore = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    Authorization: localStorage.getItem('token') || '',
    'Accept-Language': window.localStorage.getItem('language') || 'id'
  },
  paramsSerializer: params => {
    return qs.stringify(params)
  }
})

instance.interceptors.response.use(responseInterceptor, errorInterceptor)
instance.interceptors.request.use(requestInterceptor)

instanceIgnore.interceptors.response.use(responseInterceptor, errorInterceptor)
instanceIgnore.interceptors.request.use(requestInterceptor)

export { instance as handle, instanceIgnore as ignore, cancel, ROUTE_CHANGE }
export default instance
