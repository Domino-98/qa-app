<script setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

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

// Submit form
const registerUser = handleSubmit((values) => {
  const { username, email, password } = values;
  console.log(values);
  // Register user
});

// Password visibility
let passVisible = ref(false);
let passVisibleRepeat = ref(false);
</script>

<template>
  <main class="container">
    <form class="form__box" @submit.prevent="registerUser">
      <h1 class="form__signup-header">Zarejestruj się</h1>
      <div class="form__signup-group">
        <label for="" class="form__signup-label">Nazwa użytkownika</label>
        <input v-model="username" type="text" class="form__signup-input" />
        <span class="error">{{ usernameError }}</span>
      </div>
      <div class="form__signup-group">
        <label for="" class="form__signup-label">Adres e-mail</label>
        <input v-model="email" type="email" class="form__signup-input" />
        <span class="error">{{ emailError }}</span>
      </div>
      <div class="form__signup-group">
        <label for="password-new" class="form__signup-label">Hasło</label>
        <input
          v-model="password"
          :type="!passVisible ? 'password' : 'text'"
          id="password-new"
          class="form__signup-input"
        />
        <span class="error">{{ passwordError }}</span>
        <svg
          class="form__signup-icon"
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
          class="form__signup-icon"
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
      <div class="form__signup-group">
        <label for="password-repeat" class="form__signup-label"
          >Powtórz hasło</label
        >
        <input
          v-model="passwordConfirmation"
          :type="!passVisibleRepeat ? 'password' : 'text'"
          id="password-repeat"
          class="form__signup-input"
        />
        <span class="error">{{ passwordError2 }}</span>
        <svg
          class="form__signup-icon"
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
          class="form__signup-icon"
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
      <button type="Submit" class="form__signup-btn">Zarejestruj się</button>
      <p class="form__signup-register">
        Masz już konto?
        <router-link :to="{ name: 'Login' }">Zaloguj się</router-link>
      </p>
    </form>
  </main>
</template>

<style scoped>
main {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rem;
}

.form__box {
  width: 100%;
  max-width: 45rem;
  padding: 3rem;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 8px;
}

.form__signup-header {
  font-size: 2.6rem;
  font-weight: 400;
}

.form__signup-group {
  position: relative;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  margin: 1.5rem 0;
}

.form__signup-group:first-of-type {
  margin-top: 3rem;
}

.form__signup-label {
  font-size: 1.4rem;
  font-weight: 400;
  color: #0084ff;
}

.form__signup-input {
  margin-top: 0.5rem;
  font-size: 1.6em;
  padding: 1rem;
  outline: none;
  border: none;
  background-color: #eee;
  transition: all 0.2s;
}

.form__signup-input:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.form__signup-icon {
  position: absolute;
  width: 2rem;
  height: 2rem;
  color: #3b3b3b;
  top: 3.16rem;
  right: 1rem;
}

.form__signup-forgot {
  display: block;
  text-align: center;
  font-size: 1.2rem;
  text-decoration: none;
  color: #000;
}

.form__signup-btn {
  display: block;
  margin: 1rem auto;
  border: 2px solid #0084ff;
  background-color: #0084ff;
  color: #fff;
  border-radius: 2rem;
  padding: 1rem 2rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 600;
  transition: all 0.2s;
}

.form__signup-btn:hover {
  background: none;
  border: 2px solid #0084ff;
  background-color: #fff;
  color: #0084ff;
}

.form__signup-register {
  font-size: 1.2rem;
  text-align: center;
}

.form__signup-register a {
  text-decoration: none;
  color: #0084ff;
  font-weight: 700;
}

.error {
  margin-top: 0.5rem;
  color: #ff3b3b;
  font-size: 1.2rem;
}
</style>
