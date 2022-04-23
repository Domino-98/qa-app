<script setup>
import { ref, computed } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useStore } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

// Form validation
const registerSchema = yup.object({
  username: yup
    .string()
    .required("Nazwa użytkownika jest wymagana")
    .min(3, "Nazwa użytkownika musi zawierać min. 3 znaki"),
  email: yup
    .string()
    .required("Adres email jest wymagany")
    .email("Podany adres email nie jest prawidłowy"),
  password: yup
    .string()
    .required("Hasło jest wymagane")
    .min(8, "Hasło musi zawierać min. 8 znaków"),
  passwordConfirmation: yup
    .string()
    .required("Musisz potwierdzić hasło")
    .oneOf([yup.ref("password"), null], "Hasła muszą być takie same"),
});

const { handleSubmit } = useForm({
  validationSchema: registerSchema,
});

const { value: username, errorMessage: usernameError } = useField("username");
const { value: email, errorMessage: emailError } = useField("email");
const { value: password, errorMessage: passwordError } = useField("password");
const { value: passwordConfirmation, errorMessage: passwordError2 } = useField(
  "passwordConfirmation"
);

// Register user
const store = useStore();
const loading = computed(() => store.state.loading);

// Submit form
const registerUser = handleSubmit((values) => {
  const { username, email, password } = values;
  console.log(values);
  store.dispatch("signUpAction", { username, email, password });
});

// Password visibility
let passVisible = ref(false);
let passVisibleRepeat = ref(false);
</script>

<template>
  <main class="container auth">
    <form class="form__auth" @submit.prevent="registerUser">
      <Loading
        v-model:active="loading"
        :can-cancel="false"
        :is-full-page="true"
      />
      <h1 class="form__auth-header">Zarejestruj się</h1>

      <div class="form__auth-group">
        <label for="" class="form__auth-label">Nazwa użytkownika</label>
        <input v-model="username" type="text" class="form__auth-input" />
        <span class="error-msg">{{ usernameError }}</span>
      </div>
      <div class="form__auth-group">
        <label for="" class="form__auth-label">Adres e-mail</label>
        <input v-model="email" type="email" class="form__auth-input" />
        <span class="error-msg">{{ emailError }}</span>
      </div>
      <div class="form__auth-group">
        <label for="password-new" class="form__auth-label">Hasło</label>
        <input
          v-model="password"
          :type="!passVisible ? 'password' : 'text'"
          id="password-new"
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
      <div class="form__auth-group">
        <label for="password-repeat" class="form__auth-label"
          >Powtórz hasło</label
        >
        <input
          v-model="passwordConfirmation"
          :type="!passVisibleRepeat ? 'password' : 'text'"
          id="password-repeat"
          class="form__auth-input"
        />
        <span class="error-msg">{{ passwordError2 }}</span>
        <svg
          class="form__auth-icon"
          viewBox="0 0 24 24"
          @click.prevent="passVisibleRepeat = !passVisibleRepeat"
          v-if="!passVisibleRepeat"
        >
          <path
            fill="currentColor"
            d="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.5,19.3 13.28,19.5 12,19.5C7,19.5 2.73,16.39 1,12C1.69,10.24 2.79,8.69 4.19,7.46L2,5.27M12,9A3,3 0 0,1 15,12C15,12.35 14.94,12.69 14.83,13L11,9.17C11.31,9.06 11.65,9 12,9M12,4.5C17,4.5 21.27,7.61 23,12C22.18,14.08 20.79,15.88 19,17.19L17.58,15.76C18.94,14.82 20.06,13.54 20.82,12C19.17,8.64 15.76,6.5 12,6.5C10.91,6.5 9.84,6.68 8.84,7L7.3,5.47C8.74,4.85 10.33,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C12.69,17.5 13.37,17.43 14,17.29L11.72,15C10.29,14.85 9.15,13.71 9,12.28L5.6,8.87C4.61,9.72 3.78,10.78 3.18,12Z"
          />
        </svg>
        <svg
          class="form__auth-icon"
          viewBox="0 0 24 24"
          @click.prevent="passVisibleRepeat = !passVisibleRepeat"
          v-if="passVisibleRepeat"
        >
          <path
            fill="currentColor"
            d="M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M12,4.5C17,4.5 21.27,7.61 23,12C21.27,16.39 17,19.5 12,19.5C7,19.5 2.73,16.39 1,12C2.73,7.61 7,4.5 12,4.5M3.18,12C4.83,15.36 8.24,17.5 12,17.5C15.76,17.5 19.17,15.36 20.82,12C19.17,8.64 15.76,6.5 12,6.5C8.24,6.5 4.83,8.64 3.18,12Z"
          />
        </svg>
      </div>
      <button type="Submit" class="form__auth-btn">Zarejestruj się</button>
      <p class="form__auth-sign">
        Masz już konto?
        <router-link :to="{ name: 'Login' }">Zaloguj się</router-link>
      </p>
    </form>
  </main>
</template>

<style>
main.auth {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rem;
}

.form__auth {
  transition: background-color 0.2s;
  width: 100%;
  max-width: 45rem;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 8px;
  background-color: var(--background-color-secondary);
}

.form__auth-header {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 2.4rem;
  font-weight: 400;
  color: var(--text-primary-color);
}

.form__auth-group {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 1.5rem 0;
}

.form__auth-label {
  font-size: 1.4rem;
  font-weight: 400;
  color: #0084ff;
}

.form__auth-input {
  transition: all 0.2s;
  margin-top: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
  font-size: 1.6em;
  color: var(--text-primary-color);
  outline: none;
}

.form__auth-input:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.form__auth-icon {
  position: absolute;
  top: 3.16rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  color: var(--text-primary-color);
}

.form__auth-forgot {
  display: block;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  color: #0084ff;
}

.form__auth-btn {
  display: block;
  transition: all 0.2s;
  margin: 1rem auto 0;
  padding: 1rem 2rem;
  border: 2px solid #0084ff;
  border-radius: 2rem;
  background-color: #0084ff;
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
}

.form__auth-btn:hover {
  background-color: var(--background-color-secondary);
  color: #0084ff;
}

.form__auth-sign {
  margin-top: 1rem;
  font-size: 1.2rem;
  text-align: center;
  color: var(--text-primary-color);
}

.form__auth-sign a {
  text-decoration: none;
  color: #0084ff;
  font-weight: 700;
}

.error-msg {
  margin-top: 0.5rem;
  color: #ff3a3a;
  font-size: 1.2rem;
}

@media screen and (max-width: 500px) {
  .form__auth {
    margin: 0 2rem;
  }
}
</style>
