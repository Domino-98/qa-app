<script setup>
import { useRoute } from "vue-router";
import router from "../router/index";
import { reactive, ref, onMounted, watch } from "vue";
import { uid } from "uid";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";

onMounted(() => {
  window.scrollTo(0, 0);
});

const store = useStore();
const route = useRoute();

const question = ref({});
const canEditQuestion = ref();
const canEditAnswer = ref();

async function incrementViews() {
  try {
    const { data, error } = await supabase.rpc("increment_views", {
      question_id_onpage: route.params.id,
    });
  } catch (error) {
    console.log(error);
  }
}

incrementViews();

let viewCount = ref();

async function getViews() {
  try {
    const { data, error } = await supabase
      .from("views")
      .select()
      .eq("question_id", route.params.id)
      .single();

    viewCount.value = data.view_count;
  } catch (error) {
    console.log(error);
  }
}

getViews();

async function getQuestion() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select()
      .eq("id", route.params.id)
      .single();
    question.value = data;
    canEditQuestion.value = question.value.owner_user_id === user.id;
  } catch (error) {
    console.log(error);
  }
}

getQuestion();

// Edit mode
let editModeQuestion = ref(false);
let editModeAnswer = ref(false);

function editQ() {
  editModeQuestion.value = !editModeQuestion.value;
  if (typeof question.value.tags == "string") {
    question.value.tags = question.value.tags.split(",").map(function (tag) {
      return tag.trim();
    });
  }
  return;
}

function editA(answerId) {
  answers.value.forEach((answer) => {
    if (answer.id === answerId) {
      return (answer.editMode = !answer.editMode);
    }
  });
  return (editModeAnswer.value = !editModeAnswer.value);
}

function tagsToArray() {
  if (typeof question.value.tags == "object") {
    return;
  } else {
    question.value.tags = question.value.tags.trim();
    const tagsArray = question.value.tags.split(",").map(function (tag) {
      return tag.trim();
    });
    return tagsArray;
  }
}

async function editQuestion() {
  console.log(question.value.name);
  console.log(question.value.content);
  try {
    const { data, error } = await supabase
      .from("questions")
      .update({
        name: question.value.name,
        content: question.value.content,
        tags: tagsToArray(),
      })
      .match({ id: route.params.id })
      .eq("owner_user_id", user.id);
    store.commit("successMsg", "Pomyślnie zaktualizowano pytanie!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
    editModeQuestion.value = false;
    if (typeof question.value.tags == "string") {
      question.value.tags = question.value.tags.split(",").map(function (tag) {
        return tag.trim();
      });
    }
    return;
  } catch (error) {
    console.log(error);
  }
}

// Delete question

let deleteModal = ref(false);

async function deleteQuestion() {
  deleteModal.value = false;
  // Delete answers
  try {
    const { data, error } = await supabase
      .from("answers")
      .delete()
      .eq("question_id", route.params.id);
    if (error) {
      store.commit("errorMsg", error.message);
      store.commit("loading", false);
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
  // Delete views
  try {
    const { data, error } = await supabase
      .from("views")
      .delete()
      .eq("question_id", route.params.id);
    if (error) {
      store.commit("errorMsg", error.message);
      store.commit("loading", false);
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
  // Delete question
  try {
    const { data, error } = await supabase
      .from("questions")
      .delete()
      .match({ id: route.params.id })
      .eq("owner_user_id", user.id);
    deleteModal.value = false;
    if (error) {
      store.commit("errorMsg", error.message);
      store.commit("loading", false);
      throw error;
    }
    await router.push("/");
    store.commit("successMsg", "Pytanie zostało usunięte!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
  } catch (error) {
    console.log(error);
  }
}

function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " lata";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " miesięcy";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " dni";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " godzin";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minut";
  }
  return Math.floor(seconds) + " sekund";
}

const answer = reactive({
  id: uid(),
  content: "",
  created_at: new Date(),
  score: 0,
  count: 0,
  owner_display_name: "",
});

const user = supabase.auth.user();
const username = ref("");

// Get current username
async function getUsername() {
  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .single();

  username.value = data.username;
}

getUsername();

// Submit form
async function addAnswer() {
  console.log(answer);
  // Add answer
  try {
    const { error } = await supabase.from("answers").insert([
      {
        user_id: user.id,
        question_id: route.params.id,
        created_at: answer.created_at,
        content: answer.content,
        score: answer.score,
        user_display_name: username.value,
      },
    ]);
    getAnswers();
    answer.content = "";
    console.log(answer.content);
  } catch (error) {
    console.log(error);
  }
}

// Get answers
async function getAnswers() {
  try {
    const { data, error } = await supabase
      .from("answers")
      .select()
      .order("created_at", { ascending: false })
      .eq("question_id", route.params.id);
    answers.value = data;
    answers.value.forEach((answer) => {
      answer.editMode = false;
      console.log(answers.value);
    });

    answers.value.forEach((answer) => {
      if (answer.user_id == user.id) {
        answer.editable = true;
      }
    });
    console.log(answers.value);
  } catch (error) {
    console.log(error);
  }
  try {
    const { error, data, count } = await supabase
      .from("answers")
      .select("*", { count: "exact" })
      .eq("question_id", route.params.id);

    answer.count = count;
    answer.content = "";
  } catch (error) {
    console.log(error);
  }
}

getAnswers();

// Edit answer
async function editAnswer(answerId, answerContent) {
  try {
    const { data, error } = await supabase
      .from("answers")
      .update({
        content: answerContent,
      })
      .match({ id: answerId });
    store.commit("successMsg", "Pomyślnie zaktualizowano odpowiedź!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
    answers.value.forEach((answer) => {
      if (answer.id === answerId) {
        return (answer.editMode = !answer.editMode);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// Delete answer
async function deleteAnswer(answerId) {
  // Delete answer
  try {
    const { data, error } = await supabase
      .from("answers")
      .delete()
      .eq("id", answerId);
    if (error) {
      store.commit("errorMsg", error.message);
      store.commit("loading", false);
      throw error;
    }
    store.commit("successMsg", "Odpowiedź została usunięta!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
    getAnswers();
  } catch (error) {
    console.log(error);
  }
}

const answers = ref([]);
</script>

<template>
  <main class="container">
    <div class="question">
      <form @submit.prevent="editQuestion">
        <div class="question__item">
          <Transition>
            <div
              v-if="deleteModal"
              class="question__modal-overlay"
              @click.self="deleteModal = !deleteModal"
            >
              <div class="question__modal-box">
                <svg
                  class="question__modal-close"
                  @click.prevent="deleteModal = !deleteModal"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"
                  />
                </svg>
                <p class="question__modal-content">
                  Czy na pewno chcesz usunąć pytanie?
                </p>
                <button
                  class="question__modal-btn"
                  @click.prevent="deleteQuestion"
                >
                  Usuń pytanie
                </button>
              </div>
            </div>
          </Transition>
          <div v-if="canEditQuestion" class="question__btns">
            <button
              @click.prevent="editQ"
              class="question__edit"
              title="Edytuj pytanie"
            >
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M11 20V22H3C1.9 22 1 21.1 1 20V4C1 2.9 1.9 2 3 2H21C22.1 2 23 2.9 23 4V12.1L22.8 11.9C22.3 11.4 21.7 11.1 21 11.1V6H3V20H11M21.4 13.3L22.7 14.6C22.9 14.8 22.9 15.2 22.7 15.4L21.7 16.4L19.6 14.3L20.6 13.3C20.7 13.2 20.8 13.1 21 13.1C21.2 13.1 21.3 13.2 21.4 13.3M21.1 16.9L15.1 23H13V20.9L19.1 14.8L21.1 16.9Z"
                />
              </svg>
            </button>
            <button
              @click.prevent="deleteModal = !deleteModal"
              class="question__delete"
              title="Usuń pytanie"
            >
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                />
              </svg>
            </button>
          </div>
          <div class="question__item-votes">
            <div>
              <svg
                class="question__item-votes-icon question__item-votes-icon--up"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
                />
              </svg>
            </div>
            <div class="question__item-votes-score">
              <span>{{ question.score }}</span>
            </div>
            <div>
              <svg
                class="question__item-votes-icon question__item-votes-icon--down"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z"
                />
              </svg>
            </div>
          </div>

          <div>
            <p class="question__owner-date">
              Zadane przez {{ question.owner_display_name }}
              {{
                timeSince(
                  new Date(
                    Date.now() -
                      (new Date().getTime() -
                        new Date(question.created_at).getTime())
                  )
                )
              }}
              temu, {{ new Date(question.created_at).toLocaleDateString() }},
              {{ new Date(question.created_at).toLocaleTimeString() }}
            </p>
            <h1 v-if="!editModeQuestion" class="question__title">
              {{ question.name }}
            </h1>

            <input
              v-else
              placeholder="Nazwa pytania..."
              type="text"
              v-model="question.name"
              class="question__edit-name"
              required
            />
            <div class="question__info">
              <a
                v-if="!editModeQuestion"
                v-for="tag in question.tags"
                :key="tag"
                href="#"
                class="question__tag"
                >{{ tag || "Brak tagu" }}</a
              >
              <div v-else>
                <input
                  v-model="question.tags"
                  id="tags"
                  type="text"
                  class="question__edit-tags"
                  placeholder="Nowe tagi (po przecinku)"
                />
              </div>
              <span class="question__answers"
                >{{ answer.count }} odpowiedzi,</span
              >
              <span class="question__views">{{ viewCount }} wyświetleń</span>
            </div>
          </div>
        </div>

        <div class="question__content">
          <p v-if="!editModeQuestion" style="white-space: pre-wrap">
            {{ question.content }}
          </p>
          <textarea
            v-else
            v-model="question.content"
            placeholder="Treść pytania..."
            name="content"
            id="content"
            rows="5"
            class="question__edit-content"
            required
          ></textarea>
        </div>
        <button v-if="editModeQuestion" class="question__btn-edit">
          Edytuj pytanie
        </button>
      </form>
    </div>

    <section class="answers">
      <form @submit.prevent="addAnswer" class="answers__add">
        <label class="answers__label" for="answer">Treść odpowiedzi</label>
        <textarea
          v-model="answer.content"
          class="answers__input"
          name="answer"
          id="answer"
          rows="4"
          required
        ></textarea>
        <button class="answers__btn" type="submit">Dodaj odpowiedź</button>
      </form>
      <h1 class="answers__header">Odpowiedzi ({{ answer.count }})</h1>
      <div class="select-dropdown">
        <select class="answers__filter" name="Filtruj odpowiedzi" id="">
          <option value="Newest">Najnowsze</option>
          <option value="Oldest">Najstarsze</option>
          <option value="Most positive">Pozytywna ilość głosów</option>
        </select>
      </div>

      <ul class="answers__list">
        <p v-if="answers.length === 0" class="info">
          Nie odpowiedziano jeszcze na to pytanie
        </p>
        <li v-for="answer in answers" :key="answer.id" class="answers__item">
          <div class="answers__item-votes">
            <div>
              <svg
                class="answers__item-votes-icon answers__item-votes-icon--up"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
                />
              </svg>
            </div>
            <div class="answers__item-votes-score">
              <span>{{ answer.score }}</span>
            </div>
            <div>
              <svg
                class="answers__item-votes-icon answers__item-votes-icon--down"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z"
                />
              </svg>
            </div>
          </div>
          <div>
            <form @submit.prevent="editAnswer(answer.id, answer.content)">
              <p
                style="white-space: pre-wrap"
                v-if="!answer.editMode"
                class="answers__item-content"
              >
                {{ answer.content }}
              </p>
              <textarea
                v-else
                v-model="answer.content"
                class="answers__input"
                name="answer"
                id="answer"
                rows="3"
                required
              ></textarea>
              <button v-if="answer.editMode" class="answers__btn-edit">
                Edytuj odpowiedź
              </button>
            </form>

            <div class="answers__info">
              <div v-if="answer.editable" class="answers__btns">
                <button
                  @click.prevent="editA(answer.id)"
                  class="answers__edit"
                  title="Edytuj odpowiedź"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M11 20V22H3C1.9 22 1 21.1 1 20V4C1 2.9 1.9 2 3 2H21C22.1 2 23 2.9 23 4V12.1L22.8 11.9C22.3 11.4 21.7 11.1 21 11.1V6H3V20H11M21.4 13.3L22.7 14.6C22.9 14.8 22.9 15.2 22.7 15.4L21.7 16.4L19.6 14.3L20.6 13.3C20.7 13.2 20.8 13.1 21 13.1C21.2 13.1 21.3 13.2 21.4 13.3M21.1 16.9L15.1 23H13V20.9L19.1 14.8L21.1 16.9Z"
                    />
                  </svg>
                </button>
                <button
                  @click.prevent="deleteAnswer(answer.id)"
                  class="answers__delete"
                  title="Usuń odpowiedź"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                    />
                  </svg>
                </button>
              </div>
              <p>
                Odpowiedź dodana przez {{ answer.user_display_name }}
                {{
                  timeSince(
                    new Date(
                      Date.now() -
                        (new Date().getTime() -
                          new Date(answer.created_at).getTime())
                    )
                  )
                }}
                temu, {{ new Date(answer.created_at).toLocaleDateString() }},
                {{ new Date(answer.created_at).toLocaleTimeString() }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  background-color: #fff;
  box-shadow: 5px 0 5px -5px rgba(0, 0, 0, 0.2),
    -5px 0 5px -5px rgba(0, 0, 0, 0.2);
}

.info {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 1.6rem;
  font-style: italic;
  color: #3f3f3f;
}

.question {
  padding: 2rem 4rem;
  border-bottom: 2px solid #eee;
}

.question__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2rem 0;
  list-style-type: none;
}

.question__item-votes,
.answers__item-votes {
  margin-right: 2rem;
}

.question__item-votes-score,
.answers__item-votes-score {
  text-align: center;
  font-size: 2rem;
  font-weight: 400;
}

.question__item-votes-icon,
.answers__item-votes-icon {
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
}

.question__item-votes-icon--up,
.answers__item-votes-icon--up {
  color: #48df48;
}
.question__item-votes-icon--down,
.answers__item-votes-icon--down {
  color: #ff4444;
}

.question__owner-date {
  color: #3f3f3f;
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
}

.question__title {
  font-size: 2.6rem;
  font-weight: 400;
}

.question__info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
  row-gap: 0.5rem;
}

.question__content {
  font-size: 1.5rem;
  word-break: break-all;
}

.question__tag {
  text-decoration: none;
  color: #fff;
  background-color: #00a2ff;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.question__answers,
.question__views {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.answers {
  padding: 2rem 4rem;
}

.answers__header {
  font-size: 1.8rem;
  font-weight: 400;
}

.answers__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2rem 0;
  list-style-type: none;
  border-bottom: 2px solid #eee;
}

.answers__item-content {
  font-size: 1.5rem;
  word-break: break-all;
  padding-right: 11.25rem;
}

.answers__info {
  margin-top: 1.25rem;
  color: #3f3f3f;
  font-size: 1.1rem;
}

.answers__filter {
  margin-top: 0.5rem;
}

.answers__add {
  display: flex;
  flex-direction: column;
}

.answers__label {
  font-size: 1.4rem;
}

.answers__input {
  font-family: inherit;
  width: 100%;
  margin-top: 0.5rem;
  font-size: 1.6rem;
  padding: 1rem;
  border: none;
  background-color: #eee;
  resize: none;
  outline: none;
  transition: all 0.2s;
}

.answers__input:focus,
.answers__input:focus + .answers__btn {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.answers__btn {
  float: left;
  margin-bottom: 2rem;
  border: 2px solid #00aeff;
  background-color: #00aeff;
  color: #fff;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 0.5rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.answers__btn:hover {
  background: none;
  border: 2px solid #00aeff;
  background-color: #fff;
  color: #00aeff;
}

/* Custom Select */

.select-dropdown {
  margin-top: 0.5rem;
  display: inline-block;
  position: relative;
  background-color: #eee;
  border-radius: 2px;
}

.select-dropdown select {
  font-size: 1.4rem;
  font-weight: 400;
  padding: 8px 24px 8px 10px;
  outline: none;
  border: none;
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.select-dropdown select::focus,
.select-dropdown select::active {
  outline: none;
  box-shadow: none;
}

.select-dropdown::after {
  content: " ";
  position: absolute;
  top: 50%;
  margin-top: -2px;
  right: 8px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #aaa;
}

.question__btns {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.answers__btns {
  position: absolute;
  bottom: 2rem;
  right: 1rem;
}

.question__edit,
.question__delete,
.answers__edit,
.answers__delete {
  width: 4rem;
  height: 4rem;
  margin-left: 1rem;
  border: none;
  padding: 1rem;
  color: #000;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
}

.question__edit-name {
  width: 100%;
  font-size: 1.6em;
  padding: 1rem;
  outline: none;
  border: none;
  background-color: #eee;
  transition: all 0.2s;
}

.question__edit-tags {
  padding: 0.5rem;
  margin-right: 0.5em;
  font-size: 1.4em;
  outline: none;
  border: none;
  background-color: #eee;
  transition: all 0.2s;
}

.question__edit-content {
  width: 100%;
  font-family: inherit;
  margin-top: 0.5rem;
  font-size: 1.6rem;
  padding: 1rem;
  border: none;
  background-color: #eee;
  resize: none;
  outline: none;
  transition: all 0.2s;
}

.question__edit-name:focus,
.question__edit-tags:focus,
.question__edit-content:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.question__edit-content::placeholder {
  font-family: inherit;
}

.question__btn-edit,
.answers__btn-edit {
  display: block;
  margin-top: 0.5rem;
  border: 2px solid #0084ff;
  background-color: #0084ff;
  color: #fff;
  font-size: 1.2em;
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 600;
  transition: all 0.2s;
}

.question__btn-edit:hover,
.answers__btn-edit:hover {
  background: none;
  border: 2px solid #0084ff;
  background-color: #fff;
  color: #0084ff;
}

.question__modal-overlay {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.question__modal-box {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  padding: 2rem;
  background-color: #fff;
  border-radius: 1rem;
  text-align: center;
}

.question__modal-content {
  font-size: 1.8em;
  text-align: center;
  margin-top: 3rem;
}

.question__modal-close {
  position: absolute;
  width: 3;
  height: 3rem;
  color: #525252;
  cursor: pointer;
  top: 1rem;
  right: 1rem;
}

.question__modal-btn {
  margin-top: 2.5rem;
  border: 2px solid #ff3636;
  background-color: #ff3636;
  color: #fff;
  font-size: 1.2em;
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 600;
  transition: all 0.2s;
}

.question__modal-btn:hover {
  background: none;
  border: 2px solid #ff3636;
  background-color: #fff;
  color: #ff3636;
}
</style>
