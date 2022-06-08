<script setup>
import { ref, reactive } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { useStore } from "vuex";
import { supabase } from "../supabase/supabase";
import router from "../router/index";

const store = useStore();

// Form validation
const questionSchema = yup.object({
  name: yup.string().required("Nazwa pytania jest wymagana"),
  content: yup.string().required("Treść pytania jest wymagana"),
});

const { handleSubmit } = useForm({
  validationSchema: questionSchema,
});

const { value: name, errorMessage: nameError } = useField("name");
const { value: content, errorMessage: contentError } = useField("content");

const user = supabase.auth.user();
let username = ref("");

async function getUsername() {
  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  username.value = data.username;
}

getUsername();

const question = reactive({
  name: "",
  content: "",
  tags: [],
  created_at: new Date(),
  owner_display_name: "",
});

// Submit form
const addQuestion = handleSubmit(async (values) => {
  const { name, content } = values;
  question.name = name;
  question.content = content;
  pushToTags();

  let addedQuestion = ref({});

  // Add question
  try {
    const { error, data } = await supabase.from("questions").insert([
      {
        owner_user_id: user.id,
        name: question.name,
        content: question.content,
        tags: question.tags,
        created_at: question.created_at,
        owner_display_name: username.value,
      },
    ]);
    addedQuestion.value = data;
    await router.push("/");
    store.commit("successMsg", "Pomyślnie dodano pytanie!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
  } catch (error) {
    console.log(error);
  }
  try {
    const { error, data } = await supabase.from("views").insert([
      {
        question_id: addedQuestion.value[0].id,
        view_count: 0,
      },
    ]);
  } catch (error) {
    console.log(error);
  }
});

// Add tags to question
let tag = ref("");
let newTag = "";
let errorMsg = ref("");

function pushToTags() {
  newTag = tag.value.trim();
  if (question.tags.includes(newTag)) {
    tag.value = "";
    errorMsg.value = "Podany tag już istnieje na liście";
    return;
  } else if (newTag) {
    errorMsg.value = "";
    question.tags.push(newTag);
    tag.value = "";
  }
}

function removeFromTags(tag) {
  let tagToRemove = question.tags.indexOf(tag);
  question.tags.splice(tagToRemove, 1);
}
</script>

<template>
  <main class="container">
    <form class="form__question" @submit.prevent="addQuestion">
      <h1 class="form__question-header">Zadaj pytanie</h1>
      <div class="form__question-group">
        <label for="question-name" class="form__question-label"
          >Nazwa pytania</label
        >
        <input
          v-model="name"
          id="question-name"
          type="text"
          class="form__question-input"
        />
        <span class="error-msg">{{ nameError }}</span>
      </div>
      <div class="form__question-group">
        <label for="question-content" class="form__question-label"
          >Treść pytania</label
        >
        <textarea
          v-model="content"
          id="question-content"
          name="question-content"
          rows="5"
          class="form__question-content"
        ></textarea>
        <span class="error-msg">{{ contentError }}</span>
      </div>
      <div class="form__question-group">
        <label for="question-content" class="form__question-label"
          >Tagi związane z pytaniem</label
        >
        <input
          id="question-name"
          type="text"
          class="form__question-input"
          v-model="tag"
          @keydown.space="pushToTags"
        />
        <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
        <div class="form__question-tags">
          <a
            href="#"
            class="form__question-tag"
            v-for="tag in question.tags"
            :key="tag"
            @click.prevent="removeFromTags(tag)"
          >
            {{ tag }}
            <span>x</span>
          </a>
        </div>
      </div>
      <button type="Submit" class="form__question-btn">Dodaj pytanie</button>
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

.form__question {
  transition: background-color 0.2s;
  width: 100%;
  max-width: 45rem;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 8px;
  background-color: var(--background-color-secondary);
}

.form__question-header {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 2.4rem;
  font-weight: 400;
  color: var(--text-primary-color);
}

.form__question-group {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 1.5rem 0;
}

.form__question-label {
  font-size: 1.4rem;
  font-weight: 400;
  color: #0084ff;
}

.form__question-input {
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

.form__question-content {
  transition: all 0.2s;
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
  font-family: inherit;
  font-size: 1.6em;
  color: var(--text-primary-color);
  resize: none;
  outline: none;
}

.form__question-input:focus,
.form__question-content:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.form__question-btn {
  transition: all 0.2s;
  display: block;
  margin: 1rem auto 0 auto;
  padding: 1rem 2rem;
  border: 2px solid #0084ff;
  border-radius: 2rem;
  background-color: #0084ff;
  color: #fff;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
}

.form__question-btn:hover {
  background-color: var(--background-color-secondary);
  color: #0084ff;
}

.form__question-tags {
  display: flex;
  flex-wrap: wrap;
}

.form__question-tag {
  display: inline-block;
  margin-top: 1rem;
  margin-right: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: 2px solid #00a2ff;
  border-radius: 1rem;
  background-color: #00a2ff;
  text-decoration: none;
  color: #fff;
  font-size: 1.2rem;
}

.error-msg {
  margin-top: 0.5rem;
  color: #ff3b3b;
  font-size: 1.2rem;
}

@media screen and (max-width: 500px) {
  .form__question {
    margin: 0 2rem;
  }
}
</style>
