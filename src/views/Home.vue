<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";
import QuestionItem from "../components/QuestionItem.vue";

const store = useStore();
const user = supabase.auth.user();

const questions = ref([]);
let loading = ref(false);
let activeFilter = ref("recent");
let searched = ref(false);
let filteredByTag = ref(false);
const scrollComponent = ref(null);
let startIndex = ref(0);
let lastIndex = ref(9);
let scrolledToBottom = ref(false);

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Infinite scroll
const handleScroll = (e) => {
  let element = scrollComponent.value;
  if (element.getBoundingClientRect().bottom < window.innerHeight) {
    if (!scrolledToBottom.value) {
      scrolledToBottom.value = true;
      console.log("bottom");
      if (activeFilter.value === "recent") getQuestions(false, "recent");
      else if (activeFilter.value === "noAnswers")
        getQuestions(false, "noAnswers");
      else if (activeFilter.value === "answered")
        getQuestions(false, "answered");
      else if (searched.value) searchQuestions(false);

      setTimeout(() => {
        scrolledToBottom.value = false;
      }, 500);
    }
  }
};

// Fetch data / filter
async function getQuestions(tabClicked, filter) {
  if (tabClicked) {
    scrolledToBottom.value = false;
    questions.value = [];
    startIndex.value = 0;
    lastIndex.value = 9;
  }
  if (scrolledToBottom.value) {
    startIndex.value = lastIndex.value + 1;
    lastIndex.value += 10;
  }
  loading.value = true;
  searched.value = false;
  activeFilter.value = filter;
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
      .range(startIndex.value, lastIndex.value)
      .order("created_at", { ascending: false });

    if (data.length > 0) {
      if (filter === "recent") {
        questions.value.push(...data);
      } else if (filter === "noAnswers") {
        data.forEach((question) => {
          if (question.answers.length === 0) {
            questions.value.push(question);
          }
        });
      } else if (filter === "answered") {
        data.forEach((question) => {
          if (question.answers.length > 0) {
            questions.value.push(question);
          }
        });
      }

      if (questions.value.length < 10) {
        startIndex.value = lastIndex.value + 1;
        lastIndex.value += 10;
        getQuestions(false, activeFilter.value);
      }

      console.log(activeFilter.value);

      updateQuestionVotes();
      filterAnswersOnly();
    }
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
}

getQuestions(false, "recent");

// Filter answers with no parent_id
function filterAnswersOnly() {
  questions.value.forEach((question) => {
    question.answersWithoutParent = question.answers.filter(
      (answer) => answer.parent_id == null
    );
  });
}

// Search
let search = ref("");

async function searchQuestions(submitted) {
  if (submitted) {
    scrolledToBottom.value = false;
    questions.value = [];
    startIndex.value = 0;
    lastIndex.value = 9;
  }
  if (scrolledToBottom.value) {
    startIndex.value = lastIndex.value + 1;
    lastIndex.value += 10;
  }
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
      .textSearch("name", `${search.value}`)
      .range(startIndex.value, lastIndex.value)
      .order("created_at", { ascending: false });

    questions.value.push(...data);

    updateQuestionVotes();
    filterAnswersOnly();

    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
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
      .order("created_at", { ascending: false });

    questions.value = [];

    data.forEach((question) => {
      if (question.tags.includes(tag)) {
        questions.value.push(question);
      }
    });

    updateQuestionVotes();
    filterAnswersOnly();
    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
}

// Update question votes
function updateQuestionVotes() {
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
</script>

<template>
  <div>
    <main class="container">
      <div class="filters">
        <button
          class="filters__btn"
          @click.prevent="getQuestions(true, 'recent')"
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
          @click.prevent="getQuestions(true, 'noAnswers')"
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
          @click.prevent="getQuestions(true, 'answered')"
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
        <form class="filters__search" @submit.prevent="searchQuestions(true)">
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
            >( słowo kluczowe: <span class="display-name">{{ search }}</span
            >)</span
          >
          <span v-if="filteredByTag" class="searched"
            >( tag: <span class="display-name">{{ tagName }}</span
            >)</span
          >
        </h1>

        <p v-if="questions.length == 0 && !loading" class="info">Brak pytań</p>
        <ul class="questions__list" ref="scrollComponent">
          <QuestionItem
            v-for="question in questions"
            :key="question.id"
            :question="question"
            @filter-by-tag="filterByTag"
          />
        </ul>
        <img
          v-if="loading"
          src="../assets/ripple-loading.svg"
          class="loading-spinner"
        />
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

.info {
  text-align: center;
  margin-top: 2.5rem;
  font-size: 1.6rem;
  font-style: italic;
  color: var(--text-primary-color);
}

.loading-spinner {
  display: block;
  margin: 2rem auto 0;
  text-align: center;
  width: 7.5rem;
  height: 7.5rem;
}

.searched {
  display: inline-block;
  vertical-align: middle;
  font-size: 1.4rem;
}

.display-name {
  display: inline-block;
  margin: 0 0.5rem;
  color: var(--primary-color);
}
</style>
