<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
    <Button type="primary">12测试主题颜色紫色</Button>
  </div>
</template>

<script>
import { handleError } from 'lib/errorHandler'

export default {
  async mounted() {
    try {
      const { data } = await this.$axios.fetchGetList({ city: 'beijing' })
      console.log(data, '获取数据')
    } catch (error) {
      handleError(error)
    }
    this.$axios.fetchResigner({ name: 123 })
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
