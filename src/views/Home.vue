<script setup>
import { reactive, ref, computed } from "vue";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";

const store = useStore();
const user = supabase.auth.user();

const questions = ref([]);
let loading = ref(false);
let activeFilter = ref("recent");
let searched = ref(false);
let filteredByTag = ref(false);

async function getQuestions() {
  loading.value = true;
  searched.value = false;
  activeFilter.value = "recent";
  filteredByTag.value = false;
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
		*,
	 	 views (
			  view_count
		  ),
		  answers (
			  *
		  ),
		  votes_question (
			  *
		  )
	  `
      )
      .order("created_at", { ascending: false });

    console.log(data);
    questions.value = data;

    updateQuestionUpvotes();
    filterAnswersOnly();

    loading.value = false;

    console.log(questions.value);
  } catch (error) {
    console.log(error);
  }
}

getQuestions();

function filterAnswersOnly() {
  questions.value.forEach((question) => {
    question.answersWithoutParent = question.answers.filter(
      (answer) => answer.parent_id == null
    );
  });
}

function updateQuestionUpvotes() {
  questions.value.forEach((question) => {
    question.downvotes = question.votes_question.filter(
      (obj) => obj.downvoted === true
    ).length;
    question.upvotes = question.votes_question.filter(
      (obj) => obj.upvoted === true
    ).length;
    question.score = question.upvotes - question.downvotes;
    if (user) {
      let foundUpvoted = question.votes_question.find(
        (el) => el.upvoted === true && el.user_id === user.id
      );
      if (!foundUpvoted) {
        question.upvoted = false;
      } else {
        question.upvoted = true;
      }
      let foundDownvoted = question.votes_question.find(
        (el) => el.downvoted === true && el.user_id === user.id
      );
      if (!foundDownvoted) {
        question.downvoted = false;
      } else {
        question.downvoted = true;
      }
    }
  });
}

// Display vote error
function displayVoteError(question) {
  if (!user) {
    store.commit(
      "errorMsg",
      "Musisz być zalogowany by móc zagłosować na pytanie!"
    );
  } else if (question.owner_user_id == user.id) {
    store.commit("errorMsg", "Nie możesz głosować na swoje pytania!");
  }
  setTimeout(() => {
    store.commit("errorMsg", "");
  }, 3000);
}

// Upvote question
async function upvoteQuestion(question) {
  displayVoteError(question);
  if (user && question.owner_user_id != user.id) {
    try {
      const { data: upvoted, error } = await supabase
        .from("votes_question")
        .select("upvoted")
        .is("upvoted", true)
        .match({ question_id: question.id, user_id: user.id });

      if (upvoted[0]) {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: question.id,
              user_id: user.id,
              upvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          question.upvoted = false;
          question.score--;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: question.id,
              user_id: user.id,
              upvoted: true,
              downvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          if (question.downvoted) {
            question.score += 2;
          } else {
            question.score++;
          }
          question.upvoted = true;
          question.downvoted = false;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

// Downvote question
async function downvoteQuestion(question) {
  displayVoteError(question);
  if (user && question.owner_user_id != user.id) {
    try {
      const { data: downvoted, error } = await supabase
        .from("votes_question")
        .select("downvoted")
        .is("downvoted", true)
        .match({ question_id: question.id, user_id: user.id });

      if (downvoted[0]) {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: question.id,
              user_id: user.id,
              downvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          question.downvoted = false;
          question.score++;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: question.id,
              user_id: user.id,
              downvoted: true,
              upvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          if (question.upvoted) {
            question.score -= 2;
          } else {
            question.score--;
          }
          question.downvoted = true;
          question.upvoted = false;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

// Search
let search = ref("");

async function searchQuestions() {
  loading.value = true;
  searched.value = true;
  activeFilter.value = "";
  filteredByTag.value = false;
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        `*
	  ,
	 	 views (
			  view_count
		  ),
		  answers (
			  *
		  ),
		  votes_question (
			  *
		  ) `
      )
      .textSearch("name", `${search.value}`);

    questions.value = data;

    console.log(search.value);
    console.log(data);
    loading.value = false;
    updateQuestionUpvotes();
    filterAnswersOnly();

    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
}

// Filter by tag
let tagName = ref("");

async function filterByTag(tag) {
  loading.value = true;
  searched.value = false;
  activeFilter.value = "";
  tagName.value = tag;
  filteredByTag.value = true;
  try {
    const { data, error } = await supabase.from("questions").select(
      `*
	  ,
	 	 views (
			  view_count
		  ),
		  answers (
			  *
		  ),
		  votes_question (
			  *
		  ) `
    );

    questions.value = data;

    questions.value = [];

    data.forEach((question) => {
      if (question.tags.includes(tag)) {
        questions.value.push(question);
      }
    });

    updateQuestionUpvotes();
    filterAnswersOnly();
    loading.value = false;
    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
}

// Filters
async function noAnswers() {
  loading.value = true;
  activeFilter.value = "noAnswers";
  searched.value = false;
  filteredByTag.value = false;
  try {
    const { data, error } = await supabase.from("questions").select(
      `*
	  ,
	 	 views (
			  view_count
		  ),
		  answers (
			  *
		  ),
		  votes_question (
			  *
		  ) `
    );

    questions.value = [];

    data.forEach((question) => {
      if (question.answers.length === 0) {
        questions.value.push(question);
      }
    });
    updateQuestionUpvotes();
    filterAnswersOnly();
    loading.value = false;
    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
}

async function answered() {
  loading.value = true;
  activeFilter.value = "answered";
  searched.value = false;
  filteredByTag.value = false;
  try {
    const { data, error } = await supabase.from("questions").select(
      `*
	  ,
	 	 views (
			  view_count
		  ),
		  answers (
			  *
		  ),
		  votes_question (
			  *
		  ) `
    );

    questions.value = [];

    data.forEach((question) => {
      if (question.answers.length > 0) {
        questions.value.push(question);
      }
    });
    updateQuestionUpvotes();
    filterAnswersOnly();
    loading.value = false;
    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
}

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
  <div>
    <main class="container">
      <div class="filters">
        <button
          class="filters__btn"
          @click.prevent="getQuestions"
          :class="{ active: activeFilter == 'recent' }"
        >
          <svg viewBox="0 0 24 24" class="filters__btn-icon">
            <path
              fill="currentColor"
              d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
            /></svg
          ><span class="filters__btn-text">Ostatnio zadane</span>
        </button>
        <button
          @click.prevent="noAnswers"
          class="filters__btn"
          :class="{ active: activeFilter == 'noAnswers' }"
        >
          <svg viewBox="0 0 24 24" class="filters__btn-icon">
            <path
              fill="currentColor"
              d="M10,19H13V22H10V19M12,2C17.35,2.22 19.68,7.62 16.5,11.67C15.67,12.67 14.33,13.33 13.67,14.17C13,15 13,16 13,17H10C10,15.33 10,13.92 10.67,12.92C11.33,11.92 12.67,11.33 13.5,10.67C15.92,8.43 15.32,5.26 12,5A3,3 0 0,0 9,8H6A6,6 0 0,1 12,2Z"
            /></svg
          ><span class="filters__btn-text">Bez odpowiedzi</span>
        </button>
        <button
          @click.prevent="answered"
          class="filters__btn"
          :class="{ active: activeFilter == 'answered' }"
        >
          <svg viewBox="0 0 24 24" class="filters__btn-icon">
            <path
              fill="currentColor"
              d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
            /></svg
          ><span class="filters__btn-text">Z odpowiedzią</span>
        </button>
        <form class="filters__search" @submit.prevent="searchQuestions">
          <input
            v-model="search"
            type="text"
            class="filters__search-input"
            placeholder="Wyszukaj pytanie"
            required
          />
          <button type="submit" class="filters__search-btn">
            <svg type="" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
              />
            </svg>
          </button>
        </form>
      </div>

      <section class="questions">
        <h1 class="questions__header">
          Pytania
          <span v-if="searched" class="searched"
            >(słowo kluczowe: <span class="display-name">{{ search }}</span
            >)</span
          >
          <span v-if="filteredByTag" class="searched"
            >(tag: <span class="display-name">{{ tagName }}</span
            >)</span
          >
        </h1>
        <img
          v-if="loading"
          src="../assets/ripple-loading.svg"
          class="loading-spinner"
        />
        <p v-if="questions.length == 0 && !loading" class="info">Brak pytań</p>
        <ul class="questions__list">
          <li
            v-for="question in questions"
            :key="question.id"
            class="questions__item"
          >
            <div class="questions__item-votes">
              <div>
                <svg
                  v-if="!question.upvoted"
                  @click.prevent="upvoteQuestion(question)"
                  class="questions__item-votes-icon questions__item-votes-icon--up"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
                  />
                </svg>
                <svg
                  v-else
                  @click.prevent="upvoteQuestion(question)"
                  class="questions__item-votes-icon questions__item-votes-icon--up"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z"
                  />
                </svg>
              </div>
              <div class="questions__item-votes-score">
                <span>{{ question.score }}</span>
              </div>
              <div>
                <svg
                  v-if="!question.downvoted"
                  @click.prevent="downvoteQuestion(question)"
                  class="questions__item-votes-icon questions__item-votes-icon--down"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z"
                  />
                </svg>
                <svg
                  v-else
                  @click.prevent="downvoteQuestion(question)"
                  class="questions__item-votes-icon questions__item-votes-icon--down"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <router-link
                tag="p"
                :to="{
                  name: 'Question',
                  hash: '#question',
                  params: { id: question.id },
                }"
                class="questions__item-owner-date"
              >
                <span>Zadane przez</span>
                <span class="display-name">{{
                  question.owner_display_name
                }}</span>
                <span>
                  {{
                    timeSince(
                      new Date(
                        Date.now() -
                          (new Date().getTime() -
                            new Date(question.created_at).getTime())
                      )
                    )
                  }}
                </span>
                <span>
                  temu,
                  {{ new Date(question.created_at).toLocaleDateString() }},
                  {{
                    new Date(question.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </span>
              </router-link>
              <router-link
                :to="{
                  name: 'Question',
                  params: { id: question.id },
                }"
                class="questions__item-title"
                >{{ question.name }}</router-link
              >
              <div class="questions__item-info">
                <a
                  @click.prevent="filterByTag(tag)"
                  v-for="tag in question.tags"
                  :key="tag"
                  href="#"
                  class="questions__item-tag"
                  >{{ tag }}</a
                >
                <router-link
                  v-if="question.answers"
                  tag="span"
                  :to="{
                    name: 'Question',
                    params: { id: question.id },
                  }"
                  class="questions__item-answers"
                  ><span
                    >{{
                      question.answersWithoutParent.length
                    }}
                    odpowiedzi,</span
                  ></router-link
                >
                <router-link
                  v-if="question.views[0]"
                  tag="span"
                  :to="{
                    name: 'Question',
                    params: { id: question.id },
                  }"
                  class="questions__item-views"
                  ><span
                    >{{ question.views[0].view_count }} wyświetleń</span
                  ></router-link
                >
                <span v-else class="questions__item-views">0 wyświetleń</span>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
main {
  min-height: calc(100vh - 6.5rem);
  background-color: var(--background-color-secondary);
  box-shadow: 5px 0 5px -5px rgba(0, 0, 0, 0.2),
    -5px 0 5px -5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.filters {
  display: flex;
  align-items: center;
}

.filters__btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px solid var(--background-color-secondary);
  background-color: var(--background-color-secondary);
  color: var(--text-primary-color);
  cursor: pointer;
  transition: 0.2s all;
}

.filters__search {
  position: relative;
  padding: 2rem;
  flex: 3;
}

.filters__search-input {
  width: 90%;
  padding: 1rem;
  padding-right: 3.5rem;
  border-radius: 1.5rem;
  border: none;
  background-color: var(--accent-color);
  color: var(--text-primary-color);
  transition: all 0.2s;
}

.filters__search-input:focus {
  outline: none;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.filters__search-btn {
  position: absolute;
  width: 2.5rem;
  height: 2.5rem;
  right: 5.25rem;
  top: 2.5rem;
  background-color: transparent;
  border: none;
  color: var(--primary-color);
}

.active {
  border-bottom: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.filters__btn:hover {
  color: var(--primary-color);
}

.filters__btn-icon {
  color: var(--primary-color);
  width: 2rem;
  height: 2rem;
  margin-right: 0.25rem;
}

.filters__btn-text {
  font-size: 1.2rem;
}

.questions {
  padding: 2rem 4rem;
}

.questions__header {
  font-size: 2.4rem;
  font-weight: 400;
  color: var(--text-primary-color);
}

.questions__list {
}

.questions__item {
  display: flex;
  align-items: center;
  padding: 2rem 0;
  list-style-type: none;
  border-bottom: 2px solid var(--accent-color);
}

.questions__item:last-child {
  border-bottom: none;
}

.questions__item-title {
  text-decoration: none;
  color: var(--text-primary-color);
  font-size: 2rem;
  font-weight: 400;
}

.questions__item-votes {
  margin-right: 2rem;
  color: var(--text-primary-color);
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
  color: #3ed73e;
}

.questions__item-votes-icon--down {
  color: #ff3a3a;
}

.questions__item-info span {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
  row-gap: 0.5rem;
  color: var(--text-primary-color);
}

.questions__item-tag {
  text-decoration: none;
  color: var(--primary-color);
  background-color: tranparent;
  border: 2px solid var(--primary-color);
  border-radius: 1.5rem;
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.questions__item-owner-date {
  display: block;
  text-decoration: none;
  color: #7f7f7f;
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
}

.questions__item-answers,
.questions__item-views {
  display: inline-block;
  text-decoration: none;
  color: var(--text-primary-color);
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.info {
  text-align: center;
  margin-top: 2.5rem;
  font-size: 1.6rem;
  font-style: italic;
  color: var(--text-primary-color);
}

.display-name {
  display: inline-block;
  margin: 0 0.5rem;
  color: var(--primary-color);
}

.loading-spinner {
  display: block;
  margin: 4rem auto 0;
  text-align: center;
  width: 7.5rem;
  height: 7.5rem;
}

.searched {
  display: inline-block;
  vertical-align: middle;
  font-size: 1.4rem;
}
</style>
