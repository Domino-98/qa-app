<script setup>
import { ref, computed } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useStore } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

// Form validation
const loginSchema = yup.object({
  email: yup
    .string()
    .required("Adres email jest wymagany")
    .email("Podany adres email nie jest prawidłowy"),
  password: yup.string().required("Hasło jest wymagane"),
});

const { handleSubmit } = useForm({
  validationSchema: loginSchema,
});

const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");

const store = useStore();

const loading = computed(() => store.state.loading);

// Submit form
const loginUser = handleSubmit((values) => {
  const { email, password } = values;
  // Login user
  store.dispatch("signInAction", { email, password });
});

// Password visibility
let passVisible = ref(false);
</script>

<template>
  <main class="container auth">
    <form class="form__auth" @submit.prevent="loginUser">
      <Loading
        v-model:active="loading"
        :can-cancel="false"
        :is-full-page="true"
      />
      <h1 class="form__auth-header">Zaloguj się</h1>
      <div class="form__auth-group">
        <label for="email" class="form__auth-label">Adres e-mail</label>
        <input
          v-model="email"
          id="email"
          type="email"
          class="form__auth-input"
        />
        <span class="error-msg">{{ emailError }}</span>
      </div>
      <div class="form__auth-group">
        <label for="password" class="form__auth-label">Hasło</label>
        <input
          v-model="password"
          :type="!passVisible ? 'password' : 'text'"
          id="password"
          class="form__auth-input"
        />
        <span class="error-msg">{{ passwordError }}</span>
        <svg
          class="form__auth-icon"
          viewBox="0 0 24 24"
          @click.prevent="passVisible = !passVisible"
          v-if="!passVisible"
        >
          <path
            fill="currentColor"
            d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z"
          />
        </svg>
        <svg
          class="form__auth-icon"
          viewBox="0 0 24 24"
          @click.prevent="passVisible = !passVisible"
          v-if="passVisible"
        >
          <path
            fill="currentColor"
            d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z"
          />
        </svg>
      </div>
      <router-link class="form__auth-forgot" :to="{ name: 'ForgotPassword' }"
        >Zapomniałeś hasła?</router-link
      >
      <button type="Submit" class="form__auth-btn">Zaloguj się</button>
      <p class="form__auth-sign">
        Nie masz konta?
        <router-link :to="{ name: 'Register' }">Zarejestruj się</router-link>
      </p>
    </form>
  </main>
</template>

<style></style>
