<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import router from "../router/index";
import { useStore } from "vuex";
import { supabase } from "../supabase/supabase";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

const store = useStore();
const route = useRoute();

// Form validation
const passSchema = yup.object({
  newPassword: yup
    .string()
    .required("Hasło jest wymagane")
    .min(8, "Hasło musi zawierać min. 8 znaków"),
  newPassword2: yup
    .string()
    .required("Musisz potwierdzić hasło")
    .oneOf([yup.ref("newPassword"), null], "Hasła muszą być takie same"),
});

const { handleSubmit } = useForm({
  validationSchema: passSchema,
});

const { value: newPassword, errorMessage: passwordError } =
  useField("newPassword");
const { value: newPassword2, errorMessage: passwordError2 } =
  useField("newPassword2");

const resetPassword = handleSubmit(async (values) => {
  try {
    const { error, data } = await supabase.auth.api.updateUser(
      route.query["/#access_token"],
      { password: values.newPassword }
    );
    if (error) throw error;
    router.push({ name: "Home" });
    store.commit("successMsg", "Pomyślnie zmieniono hasło!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
  } catch (error) {
    store.commit("errorMsg", error.message);
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  }
});

let passVisible = ref(false);
let passVisibleRepeat = ref(false);
</script>

<template>
  <main class="container auth">
    <form class="form__auth" @submit.prevent="resetPassword">
      <h1 class="form__auth-header">Zmień hasło</h1>

      <div class="form__auth-group">
        <label for="password-new" class="form__auth-label">Nowe hasło</label>
        <input
          v-model="newPassword"
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
          >Powtórz nowe hasło</label
        >
        <input
          v-model="newPassword2"
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
      <button type="Submit" class="form__auth-btn">Zmień hasło</button>
    </form>
  </main>
</template>

<style></style>
