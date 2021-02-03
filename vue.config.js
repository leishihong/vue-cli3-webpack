const path = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin') // 通过CompressionWebpackPlugin插件build提供压缩
const TerserPlugin = require('terser-webpack-plugin') // 清楚页面会遗留console.log
const { HashedModuleIdsPlugin } = require('webpack')
const fs = require('fs')
const dotenv = require('dotenv')

function resolve(dir) {
  return path.join(__dirname, dir)
}
process.env.VUE_APP_VERSION = process.env.npm_package_version
// 是否使用gzip
// const productionGzip = true
// 需要gzip压缩的文件后缀
const productionGzipExtensions = ['js', 'css']

/**
 *
 * @param {*} keys
 * @description 读取proxy.env 文件配置动态写入数据
 */
const getProxyConfig = keys => {
  const proxyConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, './proxy.env')))
  for (const key of keys) {
    if (proxyConfig[key]) {
      return proxyConfig[key]
    }
  }
}
const genPathRewriteFunc = (curPath, keys) => {
  return (path, req) => {
    const val = getProxyConfig(keys)
    if (!val) {
      return path
    }
    return path.replace(curPath, val)
  }
}

const PROD_BUILD_PLUGIN = () => {
  let BuildPlugin = []
  if (process.env.VUE_APP_NODE_ENV !== 'development') {
    BuildPlugin = [
      // 只打包改变的文件
      new HashedModuleIdsPlugin(),
      // 构建时开启gzip，降低服务器压缩对CPU资源的占用，服务器也要相应开启gzip
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        deleteOriginalAssets: false, // 不删除源文件
        threshold: 10000, // 对超过10k的数据压缩
        minRatio: 0.8
      }),
      // 很多时候写页面会遗留console.log，影响性能。设置个drop_console就非常香
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ]
  }
  return BuildPlugin
}

// cdn预加载使用
const externals = {
  vue: 'Vue',
  'vue-router': 'VueRouter',
  vuex: 'Vuex',
  axios: 'axios',
  'view-design': 'iview',
  iview: 'ViewUI'
}

const cdn = {
  // 开发环境
  dev: {
    css: ['http://unpkg.com/view-design/dist/styles/iview.css'],
    js: []
  },
  // 生产环境
  build: {
    css: ['http://unpkg.com/view-design/dist/styles/iview.css'],
    js: [
      'https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js',
      'https://cdn.jsdelivr.net/npm/vue-router@3.2.0/dist/vue-router.min.js',
      'https://cdn.jsdelivr.net/npm/vuex@3.4.0/dist/vuex.min.js',
      'https://cdn.jsdelivr.net/npm/axios@0.19.2/dist/axios.min.js',
      'http://unpkg.com/view-design/dist/iview.min.js'
      // 'https://cdn.jsdelivr.net/npm/js-cookie@2.2.1/src/js.cookie.min.js',
      // 'https://cdn.jsdelivr.net/npm/qs@6.9.4/lib/index.min.js'
    ]
  }
}

module.exports = {
  publicPath: './',
  // 是否使用包含运行时编译器的Vue核心的构建
  runtimeCompiler: false,
  // 默认情况下 babel-loader 忽略其中的所有文件 node_modules
  transpileDependencies: [],
  // 生产环境 sourceMap
  productionSourceMap: true,
  outputDir: path.resolve(__dirname, './build/' + process.env.npm_package_version),
  assetsDir: 'static',
  indexPath: 'index.html',
  filenameHashing: true,
  integrity: false,
  devServer: {
    // can be overwritten by process.env.HOST
    // host: '0.0.0.0',
    // https: true, //TODO: 默认情况下，开发服务器将通过HTTP提供服务。可以选择使用HTTPS通过HTTP/2提供服务
    hot: true, //TODO: 启用 webpack 的 Hot Module Replacement 功能
    hotOnly: true, //TODO: 启用热模块替换
    watchContentBase: true, //TODO: 启用后，文件更改将触发整个页面重新加载
    overlay: true,
    quiet: true, //TODO: 启用 devServer.quiet 后，除了初始启动信息外，什么都不会写入控制台。 这也意味着来自webpack的错误或警告是不可见的。
    open: {
      app: ['Google Chrome', 'Chrome'] // TODO:https://webpack.docschina.org/configuration/dev-server/#devserveropen
    },
    port: 8080,
    // proxy: {
    //   '/seekersApi': {
    //     target: process.env.VUE_APP_BASE_URL,
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/api': {
    //     target: process.env.VUE_APP_BASE_URL,
    //     changeOrigin: true,
    //     secure: false
    //   },
    //   '/seekersApi2': {
    //     target: process.env.VUE_APP_BASE_URL,
    //     changeOrigin: true,
    //     secure: false
    //   }
    // },
    proxy: {
      '/seekersApi': {
        target: 'https://placeholder.com/',
        changeOrigin: true,
        secure: false,
        xfwd: false,
        pathRewrite: genPathRewriteFunc('/seekersApi', ['API_PATH_REWRITE']),
        router: () => getProxyConfig(['API_TARGET', 'TARGET'])
      },
      '/seekersApi2': {
        target: 'https://placeholder.com/',
        changeOrigin: true,
        secure: false,
        xfwd: false,
        pathRewrite: genPathRewriteFunc('/seekersApi2', ['API_PATH_REWRITE']),
        router: () => getProxyConfig(['API_TARGET', 'TARGET'])
      }
    }

    // proxy: [ //TODO: 不知怎么了在vue中不生效或报错：Instead, the type of "proxy" was "object".Either remove "proxy" from package.json, or make it an object.
    //   //TODO:配置多个本地代理只需在context中新增接口api即可
    //   //TODO:targe为接口请求地址可通过环境变量获取
    //   {
    //     context: ['/auth', '/api'],
    //     target: process.env.VUE_APP_BASE_URL,
    //     secure: false,
    //     changeOrigin: true
    //   }
    // ]
  },
  chainWebpack: config => {
    if (process.env.VUE_APP_NODE_ENV !== 'development') {
      config.plugin('html').tap(opts => {
        // opts[0].minify.removeComments = false
        return opts
      })
    }
    config.resolve.alias
      .set('src', resolve('src'))
      .set('api', resolve('src/api'))
      .set('assets', resolve('src/assets'))
      .set('lib', resolve('src/lib'))
      .set('images', resolve('src/assets/images'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .set('store', resolve('src/store'))
      .set('router', resolve('src/router'))
    // 为了补删除换行而加的配置
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        // modify the options...
        options.compilerOptions.preserveWhitespace = true
        return options
      })
    // webpack 会默认给commonChunk打进chunk-vendors，所以需要对webpack的配置进行delete
    config.optimization.delete('splitChunks')

    config.plugin('html').tap(args => {
      if (['production', 'staging', 'ali'].includes(process.env.VUE_APP_NODE_ENV)) {
        args[0].cdn = cdn.build
      }
      if (process.env.VUE_APP_NODE_ENV === 'development') {
        args[0].cdn = cdn.dev
      }
      return args
    })
  },
  // cors 相关 https://jakearchibald.com/2017/es-modules-in-browsers/#always-cors
  // corsUseCredentials: false,
  // webpack 配置，键值对象时会合并配置，为方法时会改写配置
  // https://cli.vuejs.org/guide/webpack.html#simple-configuration
  configureWebpack: {
    devtool: 'source-map',
    plugins: [...PROD_BUILD_PLUGIN()],
    externals: ['production'].includes(process.env.VUE_APP_NODE_ENV) ? externals : {},
    performance: {
      // false | "error" | "warning" // 不显示性能提示 | 以错误形式提示 | 以警告...
      hints: 'warning', // 开发环境设置较大防止警告
      // 根据入口起点的最大体积，控制webpack何时生成性能提示,整数类型,以字节为单位
      maxEntrypointSize: 50000000,
      // 最大单个资源体积，默认250000 (bytes)
      maxAssetSize: 30000000,
      assetFilter: assetFilename => {
        // Function predicate that provides asset filenames
        return assetFilename.endsWith('.css') || assetFilename.endsWith('.js')
      }
    }
  },
  pluginOptions: {
    // 配置全局less
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [resolve('src/theme/iview.less')]
    }
  },
  // 增加配置variable loader
  css: {
    modules: false,
    // 是否开启支持 foo.module.css 样式
    // requireModuleExtension: false,
    // 是否使用 css 分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用 <style> 方式内联至 html 文件中
    extract: true,
    // 是否构建样式地图，false 将提高构建速度
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      less: {
        // 配置less（其他样式解析用法一致）
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
  },
  // 构建时开启多进程处理 babel 编译
  parallel: require('os').cpus().length > 1
}
