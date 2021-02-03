import { map, keys } from 'lodash'
const files = require.context('./modules/', true, /\.js/)
const modules = {}

// 中划线 -> 驼峰
function CameLice(str) {
  return `${str}`.replace(/-\D/g, match => match.charAt(1).toUpperCase())
}

map(files.keys(), key => {
  if (key === './index.js') return
  const moduleName = CameLice(key.replace(/(^\.\/|\.js$)/g, ''))
  modules[moduleName] = files(key)
})

let AssignModules = {}
map(keys(modules), item => Object.assign(AssignModules, modules[item]))

export default AssignModules
