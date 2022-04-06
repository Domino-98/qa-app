<script setup>
import { computed } from "vue";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";

const store = useStore();

const user = computed(() => store.state.user);

function signOut() {
  store.dispatch("signOutAction");
  console.log(user);
}
</script>

<template>
  <header class="header">
    <nav class="nav container">
      <a href="#" class="nav__logo"
        ><img class="nav__logo-icon" src="../assets/communication.png" />Q&A</a
      >
      <div class="nav__btns">
        <router-link :to="{ name: 'Home' }" class="nav__btn"
          >Strona główna</router-link
        >
        <router-link :to="{ name: 'AddQuestion' }" class="nav__btn"
          >Zadaj pytanie</router-link
        >
        <router-link v-if="!user" :to="{ name: 'Login' }" class="nav__btn"
          >Zaloguj się</router-link
        >
        <a v-if="user" href="#" class="nav__btn" @click.prevent="signOut"
          >Wyloguj się</a
        >
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  background-color: #161b2c;
}

.nav {
  width: 100%;
  margin: auto;
  display: flex;
  padding: 1.5rem;
}

.nav__logo {
  display: flex;
  align-items: center;
  margin-right: auto;
  font-size: 2.5rem;
  font-family: Oxygen, Helvetica, Arial, sans-serif;
  color: #fff;
  text-decoration: none;
  /* text-shadow: 0px 4px 3px rgba(0, 0, 0, 0.4), 0px 8px 13px rgba(0, 0, 0, 0.1),
    0px 18px 23px rgba(0, 0, 0, 0.1); */
}

.nav__logo-icon {
  width: 4.5rem;
  margin-right: 1rem;
}

.nav__btns {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__btn {
  color: #00a2ff;
  font-size: 1.6rem;
  border-radius: 1rem;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  text-decoration: none;
  color: #fff;
  transition: all 0.2s ease;
}

.nav__btn:not(:last-child) {
  margin-right: 1rem;
}

.nav__btn:hover {
  background-color: #00a2ff;
  box-shadow: 0px 0.25rem 0.5rem #2e9ce566;
  color: #fff;
}
</style>
