<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import { supabase } from "../supabase/supabase";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import AnswerItem from "../components/AnswerItem.vue";
import QuestionDetails from "../components/QuestionDetails.vue";

onMounted(() => {
  window.scrollTo(0, 0);
});

const store = useStore();
const route = useRoute();
const user = supabase.auth.user();

const question = ref({});
const answers = ref([]);
const questionAnswers = computed(() => {
  return answers.value.filter((answer) => answer.parent_id == null);
});

// Increment question views
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

async function getQuestion() {
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
			  id
		  ),
		  votes_question (
			  *
		  )
	  `
      )
      .eq("id", route.params.id)
      .single();
    question.value = data;
    question.value.views = data.views[0].view_count;

    updateQuestionVotes();

    if (user)
      question.value.editable = question.value.owner_user_id === user.id;

    getAnswers();
  } catch (error) {
    console.log(error);
  }
}

getQuestion();

// Update question votes
function updateQuestionVotes() {
  question.value.downvotes = question.value.votes_question.filter(
    (obj) => obj.downvoted === true
  ).length;
  question.value.upvotes = question.value.votes_question.filter(
    (obj) => obj.upvoted === true
  ).length;
  question.value.score = question.value.upvotes - question.value.downvotes;
  if (user) {
    let foundUpvoted = question.value.votes_question.find(
      (el) => el.upvoted === true && el.user_id === user.id
    );
    if (!foundUpvoted) {
      question.value.upvoted = false;
    } else {
      question.value.upvoted = true;
    }

    let foundDownvoted = question.value.votes_question.find(
      (el) => el.downvoted === true && el.user_id === user.id
    );
    if (!foundDownvoted) {
      question.value.downvoted = false;
    } else {
      question.value.downvoted = true;
    }
  }
}

// Get answers
async function getAnswers() {
  try {
    const { data, error } = await supabase
      .from("answers")
      .select(
        `
		*,
		  votes_answer (
			  *
		  )
	  `
      )
      .order("created_at", { ascending: false })
      .eq("question_id", route.params.id);

    answers.value = data;
    updateAnswerVotes();

    answers.value.forEach((answer) => {
      answer.editMode = false;
      if (answer.id == question.value.accepted_answer_id) {
        answer.accepted_answer = true;
      } else {
        answer.accepted_answer = false;
      }
    });

    if (user) {
      answers.value.forEach((answer) => {
        if (answer.user_id == user.id) {
          answer.editable = true;
        }
      });
    }

    answers.value.forEach((answer) => {
      answer.replies = [];
      answers.value.forEach((reply) => {
        if (reply.parent_id == answer.id) {
          answer.replies.push(reply);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
}

// Update answer votes
function updateAnswerVotes() {
  answers.value.forEach((answer) => {
    answer.downvotes = answer.votes_answer.filter(
      (obj) => obj.downvoted === true
    ).length;
    answer.upvotes = answer.votes_answer.filter(
      (obj) => obj.upvoted === true
    ).length;
    answer.score = answer.upvotes - answer.downvotes;
    if (user) {
      let foundUpvoted = answer.votes_answer.find(
        (el) => el.upvoted === true && el.user_id === user.id
      );
      if (!foundUpvoted) {
        answer.upvoted = false;
      } else {
        answer.upvoted = true;
      }
      let foundDownvoted = answer.votes_answer.find(
        (el) => el.downvoted === true && el.user_id === user.id
      );
      if (!foundDownvoted) {
        answer.downvoted = false;
      } else {
        answer.downvoted = true;
      }
    }
  });
}

let username = ref("");

// Submit form
async function addAnswer(event) {
  if (!user) {
    store.commit("errorMsg", "Musisz być zalogowany by móc dodać odpowiedź!");
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  } else {
    // Get username
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      username.value = data.username;
    } catch (error) {
      console.log(error);
    }
    // Add answer
    try {
      const { error } = await supabase.from("answers").insert([
        {
          user_id: user.id,
          question_id: route.params.id,
          created_at: new Date(),
          content: event.target[0].value,
          user_display_name: username.value,
        },
      ]);

      getAnswers();
      event.target[0].value = "";
    } catch (error) {
      console.log(error);
    }
  }
}

// Comment filters
const filterType = ref("Newest");

watchEffect(() => {
  if (filterType.value === "Newest") {
    answers.value.sort(
      (b, a) => new Date(a.created_at) - new Date(b.created_at)
    );
  } else if (filterType.value === "Oldest") {
    answers.value.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  } else if (filterType.value === "Positive") {
    answers.value.sort((b, a) => a.score - b.score);
  }
});

// Choose the best answer
async function bestAnswer(answer) {
  if (question.value.owner_user_id == user.id) {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("accepted_answer_id")
        .match({ id: route.params.id })
        .single();

      if (
        data.accepted_answer_id == null ||
        data.accepted_answer_id != answer.id
      ) {
        try {
          const { data, error } = await supabase
            .from("questions")
            .update({ accepted_answer_id: answer.id })
            .match({ id: route.params.id });

          answers.value.forEach((answer) => {
            answer.accepted_answer = false;
          });
          answer.accepted_answer = true;
        } catch (error) {
          console.log(error);
        }
      } else if (data.accepted_answer_id == answer.id) {
        try {
          const { data, error } = await supabase
            .from("questions")
            .update({ accepted_answer_id: null })
            .match({ id: route.params.id });

          answer.accepted_answer = false;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
</script>

<template>
  <div>
    <main class="container">
      <QuestionDetails
        :question="question"
        :answersCount="questionAnswers.length"
      />
      <section class="answers">
        <form @submit.prevent="addAnswer($event)" class="answers__add">
          <label class="answers__label" for="answer"
            >Treść odpowiedzi
            <span v-show="!user">(Musisz być zalogowany)</span></label
          >
          <textarea
            class="answers__input"
            name="answer"
            id="answer"
            rows="4"
            required
          ></textarea>
          <button class="answers__btn" type="submit">Dodaj odpowiedź</button>
        </form>
        <h1 class="answers__header">
          Odpowiedzi ({{ questionAnswers.length }})
        </h1>
        <div class="select-dropdown">
          <select
            class="answers__filter"
            name="Filtruj odpowiedzi"
            v-model="filterType"
          >
            <option value="Newest">Najnowsze</option>
            <option value="Oldest">Najstarsze</option>
            <option value="Positive">Pozytywna ilość głosów</option>
          </select>
        </div>
        <p v-if="answers.length === 0" class="info">
          Nie odpowiedziano jeszcze na to pytanie
        </p>
        <ul class="answers__list">
          <AnswerItem
            v-for="answer in questionAnswers"
            :key="answer.id"
            :answers="answers"
            :answer="answer"
            :can-choose-answer="question.editable"
            @best-answer="bestAnswer"
            @get-answers="getAnswers"
          />
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped>
main {
  transition: all 0.2s;
  min-height: calc(100vh - 6.5rem);
  box-shadow: 5px 0 5px -5px rgba(0, 0, 0, 0.2),
    -5px 0 5px -5px rgba(0, 0, 0, 0.2);
  background-color: var(--background-color-secondary);
}

.info {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 1.6rem;
  font-style: italic;
  color: var(--text-primary-color);
}

.answers {
  padding: 2rem 4rem;
}

.answers__header {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--text-primary-color);
}

.answers__add {
  display: flex;
  flex-direction: column;
}

.answers__label {
  color: var(--text-primary-color);
  font-size: 1.4rem;
}

.answers__input {
  transition: all 0.2s;
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
  font-family: inherit;
  font-size: 1.6rem;
  color: var(--text-primary-color);
  resize: none;
  outline: none;
}

.answers__input:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.answers__btn {
  align-self: start;
  transition: all 0.2s;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--btn-color);
  border-radius: 1.5rem;
  background-color: var(--btn-color);
  color: #eee;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 1.2rem;
  cursor: pointer;
}

.answers__btn:hover {
  background-color: var(--background-color-secondary);
  color: var(--btn-color);
}

/* Custom Select */
.select-dropdown {
  position: relative;
  display: inline-block;
  margin-top: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
}

.select-dropdown select {
  padding: 8px 24px 8px 10px;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-primary-color);
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.select-dropdown select::focus,
.select-dropdown select::active {
  box-shadow: none;
  outline: none;
}

.select-dropdown::after {
  content: " ";
  position: absolute;
  top: 50%;
  right: 8px;
  margin-top: -2px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #aaa;
}

@media screen and (max-width: 768px) {
  .answers {
    padding: 1.5rem 2rem;
  }
}
</style>
