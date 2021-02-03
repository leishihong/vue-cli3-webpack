import { handle as fetchApi, ignore as fetchIgnoreApi } from 'lib/axios'

export const fetchLogin = params => fetchApi.post('saas/user/login', params)

export const fetchResigner = params => fetchIgnoreApi.post('saas/user/login', params)

/**
 *
 * @param {city} {city:'beijing'}
 * @description 首页 -人才PC端
 */
export const fetchGetList = params => fetchApi.post('seekersApi/common/seekers/index', params)
