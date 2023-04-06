<template>
  <div id="app">
    <div id="nav">
      <router-link to="/home">Home</router-link>
      |
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    console.log(this)
    console.log(this.$router)
    console.log(this.$route)
  }
}
</script>
