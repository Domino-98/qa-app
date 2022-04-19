<script setup>
import { ref, computed } from "vue";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

const store = useStore();
const loading = computed(() => store.state.loading);
const email = ref("");

async function sendLink() {
  store.commit("loading", true);
  try {
    const { data, error } = await supabase.auth.api.resetPasswordForEmail(
      email.value
    );

    if (error) throw error;
    store.commit("successMsg", "Wysłano link z instrukcją!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
  } catch (error) {
    store.commit("errorMsg", error.message);
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  }
  store.commit("loading", false);
}
</script>

<template>
  <main class="container auth">
    <form class="form__auth" @submit.prevent="sendLink">
      <Loading
        v-model:active="loading"
        :can-cancel="false"
        :is-full-page="true"
      />
      <h1 class="form__auth-header">Wyślij link do zmiany hasła</h1>

      <div class="form__auth-group">
        <label for="password" class="form__auth-label">Email</label>
        <input
          type="email"
          v-model="email"
          id="password"
          class="form__auth-input"
          required
        />
      </div>
      <button type="Submit" class="form__auth-btn">Wyślij link</button>
    </form>
  </main>
</template>

<style></style>
