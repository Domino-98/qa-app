<script setup>
import AppNav from "../src/components/Nav.vue";
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const success = computed(() => store.state.successMsg);
const error = computed(() => store.state.errorMsg);
</script>

<template>
  <AppNav />
  <Transition>
    <p v-if="success" class="msg success">{{ success }}</p>
  </Transition>
  <Transition>
    <p v-if="error" class="msg error">{{ error }}</p>
  </Transition>
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

.msg {
  position: fixed;
  bottom: 2.5rem;
  left: 50%;
  width: auto;
  z-index: 9999;
  transform: translate(-50%, -50%);
  margin: 0 auto;
  font-size: 1.6rem;
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
}

.success {
  background-color: #28cf28;
}

.error {
  background-color: #ff3a3a;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
