<script setup>
import { useRoute } from "vue-router";
import { ref, reactive, watch } from "vue";
import { uid } from "uid";

const route = useRoute();

const questionId = route.params.id;

const answer = reactive({
  id: uid(),
  content: "",
  timestamp: new Date(),
  score: 0,
  user_display_name: "Dominik",
});

function addAnswer() {
  console.log(answer);
}

const question = reactive({
  id: 1,
  name: "Pytanie 1",
  content:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.?",
  tags: ["vue", "javascript", "programowanie"],
  timestamp: "03.04.2022",
  answer_count: 5,
  view_count: 10,
  score: 4,
  owner_display_name: "Dominik",
});

const answers = reactive([
  {
    id: 1,
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.? Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.?",
    timestamp: "03.04.2022",
    score: 3,
    user_display_name: "Krzysztof",
  },
  {
    id: 2,
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.? Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.?",
    timestamp: "03.04.2022",
    score: 10,
    user_display_name: "Dominoo",
  },
  {
    id: 3,
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.? Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, dolorem.?",
    timestamp: "03.04.2022",
    score: -3,
    user_display_name: "Buczek",
  },
]);
</script>

<template>
  <main class="container">
    <div class="question">
      <div class="question__item">
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
            Zadane przez {{ question.owner_display_name }}, utworzono
            {{ question.timestamp }}
          </p>
          <h1 class="question__title">{{ question.name }}</h1>
          <div class="question__info">
            <a
              v-for="tag in question.tags"
              :key="tag"
              href="#"
              class="question__tag"
              >{{ tag }}</a
            >
            <span class="question__answers"
              >{{ question.answer_count }} odpowiedzi,</span
            >
            <span class="question__views"
              >{{ question.view_count }} wyświetleń</span
            >
          </div>
        </div>
      </div>

      <div class="question__content">
        <p>{{ question.content }}</p>
      </div>
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
      <h1 class="answers__header">Odpowiedzi ({{ question.answer_count }})</h1>
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
            <p class="answers__item-content">
              {{ answer.content }}
            </p>
            <div class="answers__info">
              <p>
                Odpowiedź dodana przez {{ answer.user_display_name }} dnia
                {{ answer.timestamp }}
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
  clear: both;
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

.answers__item {
  display: flex;
  align-items: center;
  padding: 2rem 0;
  list-style-type: none;
  border-bottom: 2px solid #eee;
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

.answers__list {
}

.answers__item {
}

.answers__item-content {
  font-size: 1.5rem;
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
  font-size: 1.6em;
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
</style>
