<script setup>
import AppNav from "../src/components/Nav.vue";
</script>

<template>
  <AppNav />
  <router-view></router-view>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700&display=swap");

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
  scroll-behavior: smooth;
}

html {
  box-sizing: border-box;
  font-size: 62.5%;
  background-color: #eee;
}

#app {
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 100rem;
  margin: auto;
}
</style>
