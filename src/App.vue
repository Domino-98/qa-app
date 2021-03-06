<script setup>
import AppNav from "./components/Nav.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { supabase } from "./supabase/supabase";
import router from "./router/index";

const store = useStore();

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    const fullPath = router.currentRoute.value.fullPath;
    const urlSearchParams = new URLSearchParams(fullPath);
    const searchQuery = Object.fromEntries(urlSearchParams.entries());
    setTimeout(() => {
      router.push({
        name: "ResetPassword",
        query: searchQuery,
      });
    }, 100);
  } else {
    store.commit("setUser", session);
  }
});

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
  <router-view v-slot="{ Component }">
    <transition mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

:root {
  --btn-color: #2097ff;
  --primary-color: #0088ff;
  --background-color-primary: #ebebeb;
  --background-color-secondary: #fafafa;
  --accent-color: #ddd;
  --text-primary-color: #222;
  --manage-btn-bg-color: #ccc;
}

:root.dark {
  --primary-color: #00d5ff;
  --background-color-primary: #1e1e1e;
  --background-color-secondary: #2d2d30;
  --accent-color: #3f3f3f;
  --text-primary-color: #ddd;
  --manage-btn-bg-color: #666;
}

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
  background-color: var(--accent-color);
  transition: background-color 0.2s;
}

#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 95rem;
  margin: auto;
}

.msg {
  position: fixed;
  bottom: 2.5rem;
  left: 50%;
  z-index: 9999;
  transform: translate(-50%, -50%);
  width: auto;
  margin: 0 auto;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1.6rem;
  color: #fff;
}

.success {
  text-align: center;
  background-color: #3ed73e;
}

.error {
  text-align: center;
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

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(5rem);
}

@media screen and (max-width: 768px) {
  html {
    font-size: 56.25%;
  }
}
</style>
