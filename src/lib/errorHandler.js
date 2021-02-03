import Cookies from 'js-cookie'
import { Notice } from 'view-design'

export function isAxiosError(object) {
  return object.config !== undefined
}

export const handleError = error => {
  console.log(error, '---')
  if (isAxiosError(error)) {
    if (error.response) {
      const response = error.response
      if (response.status === 200) {
        const IResponseCode = response.data.code
        if (IResponseCode && IResponseCode.toLocaleUpperCase() === 'SUCCESS') {
          console.log(999)
        } else {
          Notice.error({
            title: 'Tips',
            desc: response.data.message,
            duration: 4
          })
        }
      } else {
        if (response.status === 401) {
          Cookies.remove('token')
          window.localStorage.clear()
          window.sessionStorage.clear()
          // TODO
          // window.globals.authorization = null;
          // history.push('/login');
          Notice.open({
            title: 'Tips',
            desc: 'Token kadaluarsa, silahkan refresh laman ini dan coba lagi',
            duration: 10
          })
        } else {
          Notice.error({
            title: 'Tips',
            desc: response.data.message || 'The server is abnormal, please try again later',
            duration: 4
          })
        }
      }
    } else if (error.request) {
      Notice.open({
        title: 'error',
        desc: 'Network error'
      })
    } else {
      Notice.open({
        title: 'error',
        desc: 'Server error'
      })
    }
  } else {
    // Raven.captureException(error);
    console.log('normal error', error)
    Notice.open({
      title: 'error',
      desc: error.message
    })
  }
}
