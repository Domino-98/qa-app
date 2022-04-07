<script setup>
import { reactive, ref } from "vue";
import { supabase } from "../supabase/supabase";

const questions = ref([]);

async function getQuestions() {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select()
      .order("created_at", { ascending: false });
    questions.value = data;
    console.log(questions);
  } catch (error) {
    console.log(error);
  }
}

getQuestions();

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

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
</script>

<template>
  <main class="container">
    <div class="filters">
      <button class="filters__btn active">
        <svg viewBox="0 0 24 24" class="filters__btn-icon">
          <path
            fill="currentColor"
            d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
          /></svg
        ><span class="filters__btn-text">Ostatnio zadane</span>
      </button>
      <button class="filters__btn">
        <svg viewBox="0 0 24 24" class="filters__btn-icon">
          <path
            fill="currentColor"
            d="M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z"
          /></svg
        ><span class="filters__btn-text">Bez odpowiedzi</span>
      </button>
      <button class="filters__btn">
        <svg viewBox="0 0 24 24" class="filters__btn-icon">
          <path
            fill="currentColor"
            d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
          /></svg
        ><span class="filters__btn-text">Z odpowiedzią</span>
      </button>
      <button class="filters__btn">
        <svg viewBox="0 0 24 24" class="filters__btn-icon">
          <path
            fill="currentColor"
            d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"
          /></svg
        ><span class="filters__btn-text">Z największą liczbą głosów</span>
      </button>
      <!-- <form class="filters_search-form">
        <input
          type="text"
          class="filters__search"
          placeholder="Znajdź pytanie"
        />
        <button type="submit" class="filters__btn-search">
          <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
            />
          </svg>
        </button>
      </form> -->
    </div>

    <section class="questions">
      <h1 class="questions__header">Pytania</h1>
      <p v-if="questions.length === 0" class="info">Brak pytań</p>
      <ul class="questions__list">
        <li
          v-for="question in questions"
          :key="question.id"
          class="questions__item"
        >
          <div class="questions__item-votes">
            <div>
              <svg
                class="questions__item-votes-icon questions__item-votes-icon--up"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
                />
              </svg>
            </div>
            <div class="questions__item-votes-score">
              <span>{{ question.score }}</span>
            </div>
            <div>
              <svg
                class="questions__item-votes-icon questions__item-votes-icon--down"
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
            <p class="questions__item-owner-date">
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
            <router-link
              :to="`/question/${question.id}`"
              class="questions__item-title"
              >{{ question.name }}</router-link
            >
            <div class="questions__item-info">
              <a
                v-for="tag in question.tags"
                :key="tag"
                href="#"
                class="questions__item-tag"
                >{{ tag }}</a
              >
              <span class="questions__item-answers"
                >{{ question.answer_count }} odpowiedzi,</span
              >
              <span class="questions__item-views"
                >{{ question.view_count }} wyświetleń</span
              >
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

.active {
  background: /* gradient can be an image */ linear-gradient(
      to left,
      rgb(0, 132, 255) 0%,
      rgb(0, 174, 255) 12%,
      rgb(0, 132, 255) 47%,
      rgb(0, 174, 255) 100%
    )
    left bottom #777 no-repeat;
  background-size: 100% 3px; /* if linear-gradient, we need to resize it */
  color: #0084ff;
}

.filters {
  display: flex;
  align-items: center;
}

.filters__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  border: none;
  background-color: #fff;
  cursor: pointer;
}

.filters__btn-icon {
  color: #00aeff;
  width: 2rem;
  height: 2rem;
  margin-right: 0.25rem;
  position: relative;
}

.filters__btn-text {
  font-size: 1.2rem;
}

.filters_search-form {
  margin: auto;
}

.filters__search {
  font-size: 1.2rem;
  padding: 0.75rem 3rem 0.75rem 1rem;
  outline: none;
  border: none;
  border-bottom: 3px solid #00aeff;
}

.filters__btn-search {
  top: 0.6em;
  right: 2.5rem;
  position: relative;
  background-color: transparent;
  border: none;
  color: #1a1e2b;
}

.questions {
  padding: 2rem 4rem;
}

.questions__header {
  font-size: 2.4rem;
  font-weight: 400;
}

.questions__list {
}

.questions__item {
  display: flex;
  align-items: center;
  padding: 2rem 0;
  list-style-type: none;
  border-bottom: 2px solid #eee;
}

.questions__item-title {
  text-decoration: none;
  color: #000;
  font-size: 2rem;
  font-weight: 400;
}

.questions__item-votes {
  margin-right: 2rem;
}

.questions__item-votes-score {
  text-align: center;
  font-size: 2rem;
  font-weight: 400;
}

.questions__item-votes-icon {
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
}

.questions__item-votes-icon--up {
  color: #48df48;
}

.questions__item-votes-icon--down {
  color: #ff4444;
}

.questions__item-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
  row-gap: 0.5rem;
}

.questions__item-tag {
  text-decoration: none;
  color: #fff;
  background-color: #00a2ff;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.questions__item-owner-date {
  color: #3f3f3f;
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
}

.questions__item-answers,
.questions__item-views {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.info {
  text-align: center;
  margin-top: 2.5rem;
  font-size: 1.6rem;
  font-style: italic;
  color: #3f3f3f;
}
</style>
