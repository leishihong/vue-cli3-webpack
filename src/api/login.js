import { handle as fetchApi, ignore as fetchIgnoreApi } from 'lib/axios'

export const fetchLogin = params => fetchApi.post('XXXXXX', params)

export const fetchResigner = params => fetchIgnoreApi.post('xxxx', params)
