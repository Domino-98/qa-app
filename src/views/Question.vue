<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import { supabase } from "../supabase/supabase";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import router from "../router/index";
import AnswerItem from "../components/AnswerItem.vue";
import timeSince from "../shared";

onMounted(() => {
  window.scrollTo(0, 0);
});

const store = useStore();
const route = useRoute();
const user = supabase.auth.user();

const question = ref({});
const answers = ref([]);
const answersWithoutParent = computed(() => {
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

const canEditQuestion = ref();

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

    if (user) canEditQuestion.value = question.value.owner_user_id === user.id;
    getAnswers();

    console.log(question.value);
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

// Edit mode
let editModeQuestion = ref(false);

function editQ() {
  editModeQuestion.value = !editModeQuestion.value;
  if (typeof question.value.tags == "string") {
    question.value.tags = question.value.tags.split(",").map(function (tag) {
      return tag.trim();
    });
  }
  return;
}

function tagsToArray() {
  if (typeof question.value.tags == "object") {
    return;
  } else {
    question.value.tags = question.value.tags.trim();
    let tagsArray = question.value.tags.split(",").map(function (tag) {
      return tag.trim();
    });
    tagsArray = tagsArray.filter((tag) => {
      return tag !== "";
    });
    return tagsArray;
  }
}

async function editQuestion() {
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

    if (typeof question.value.tags === "string") {
      question.value.tags = tagsToArray();
    }
    store.commit("successMsg", "Pytanie zostało zedytowane!");
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
  // Delete answer votes
  try {
    const { data, error } = await supabase
      .from("votes_answer")
      .delete()
      .eq("question_id", route.params.id);
    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
  // Delete question votes
  try {
    const { data, error } = await supabase
      .from("votes_question")
      .delete()
      .eq("question_id", route.params.id);
    if (error) {
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
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
  // Delete answers
  try {
    const { data, error } = await supabase
      .from("answers")
      .delete()
      .eq("question_id", route.params.id);

    if (error) {
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
    console.log(answers.value);

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

    console.log(answers.value);
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
  console.log(username.value);
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

function displayVoteError() {
  if (!user) {
    store.commit(
      "errorMsg",
      "Musisz być zalogowany by móc zagłosować na pytanie!"
    );
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  } else if (question.value.owner_user_id === user.id) {
    store.commit("errorMsg", "Nie możesz głosować na swoje pytania!");
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  }
}

// Upvote question
async function upvoteQuestion() {
  displayVoteError();
  if (user && question.value.owner_user_id !== user.id) {
    try {
      const { data: upvoted, error } = await supabase
        .from("votes_question")
        .select("upvoted")
        .is("upvoted", true)
        .match({ question_id: route.params.id, user_id: user.id });

      if (upvoted[0]) {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: route.params.id,
              user_id: user.id,
              upvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          question.value.upvoted = false;
          question.value.score--;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: route.params.id,
              user_id: user.id,
              upvoted: true,
              downvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          if (question.value.downvoted) {
            question.value.score += 2;
          } else {
            question.value.score++;
          }
          question.value.upvoted = true;
          question.value.downvoted = false;
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
async function downvoteQuestion() {
  displayVoteError();
  if (user && question.value.owner_user_id !== user.id) {
    try {
      const { data: downvoted, error } = await supabase
        .from("votes_question")
        .select("downvoted")
        .is("downvoted", true)
        .match({ question_id: route.params.id, user_id: user.id });

      if (downvoted[0]) {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: route.params.id,
              user_id: user.id,
              downvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          question.value.downvoted = false;
          question.value.score++;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const { error, data } = await supabase.from("votes_question").upsert(
            {
              question_id: route.params.id,
              user_id: user.id,
              downvoted: true,
              upvoted: false,
            },
            { onConflict: "question_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          if (question.value.upvoted) {
            question.value.score -= 2;
          } else {
            question.value.score--;
          }
          question.value.downvoted = true;
          question.value.upvoted = false;
        } catch (error) {
          console.log(error);
        }
      }
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

      console.log("accepted id", data.accepted_answer_id);
      console.log("passed id", answer.id);
      if (
        data.accepted_answer_id == null ||
        data.accepted_answer_id != answer.id
      ) {
        try {
          const { data, error } = await supabase
            .from("questions")
            .update({ accepted_answer_id: answer.id })
            .match({ id: route.params.id });

          console.log(data);
          answers.value.forEach((answer) => {
            answer.accepted_answer = false;
          });
          answer.accepted_answer = true;
          console.log(answer);
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
          console.log(answer);
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
                  v-if="!question.upvoted"
                  @click.prevent="upvoteQuestion"
                  class="question__item-votes-icon question__item-votes-icon--up"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
                  />
                </svg>
                <svg
                  v-else
                  @click.prevent="upvoteQuestion"
                  class="question__item-votes-icon question__item-votes-icon--up"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z"
                  />
                </svg>
              </div>
              <div class="question__item-votes-score">
                <span>{{ question.score }}</span>
              </div>
              <div>
                <svg
                  v-if="!question.downvoted"
                  @click.prevent="downvoteQuestion"
                  class="question__item-votes-icon question__item-votes-icon--down"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z"
                  />
                </svg>
                <svg
                  v-else
                  @click.prevent="downvoteQuestion"
                  class="question__item-votes-icon question__item-votes-icon--down"
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
              <p class="question__owner-date">
                Zadane przez
                <span class="display-name">{{
                  question.owner_display_name
                }}</span>
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
                {{
                  new Date(question.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
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
                  >{{ tag }}</a
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
                  >{{ answersWithoutParent.length }} odpowiedzi,</span
                >
                <span class="question__views"
                  >{{ question.views }} wyświetleń</span
                >
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
              rows="4"
              class="question__edit-content"
              required
            ></textarea>
          </div>
          <button
            v-if="editModeQuestion"
            class="question__btn question__btn--edit"
          >
            Edytuj pytanie
          </button>
        </form>
      </div>

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
          Odpowiedzi ({{ answersWithoutParent.length }})
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
            v-for="answer in answersWithoutParent"
            :key="answer.id"
            :answers="answers"
            :answer="answer"
            :can-choose-answer="canEditQuestion"
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

.question {
  padding: 2rem 4rem;
  border-bottom: 2px solid var(--accent-color);
}

.question__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 2rem 0;
  list-style-type: none;
}

.question__item-votes {
  align-self: flex-start;
  margin-right: 2rem;
  color: var(--text-primary-color);
}

.question__item-votes-score {
  text-align: center;
  font-size: 2rem;
  font-weight: 400;
}

.question__item-votes-icon {
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
}

.question__item-votes-icon--up {
  color: #3ed73e;
}
.question__item-votes-icon--down {
  color: #ff3a3a;
}

.question__title {
  font-size: 2.4rem;
  font-weight: 400;
  color: var(--text-primary-color);
}

.question__info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
  row-gap: 0.5rem;
  color: var(--text-primary-color);
}

.question__content {
  font-size: 1.6rem;
  color: var(--text-primary-color);
  word-break: break-all;
}

.question__tag {
  margin-right: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: 2px solid var(--primary-color);
  border-radius: 1.5rem;
  background-color: transparent;
  text-decoration: none;
  color: var(--primary-color);
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

.question__owner-date {
  margin-bottom: 1.25rem;
  color: #7f7f7f;
  font-size: 1.2rem;
}

.display-name {
  color: var(--primary-color);
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

.question__btns {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.question__edit,
.question__delete {
  transition: all 0.2s;
  width: 4rem;
  height: 4rem;
  margin-left: 1rem;
  padding: 1rem;
  border: none;
  border-radius: 50%;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  background-color: var(--manage-btn-bg-color);
  color: var(--text-primary-color);
  cursor: pointer;
}

.question__edit:hover,
.question__delete:hover {
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  background-color: var(--accent-color);
  color: var(--text-primary-color);
}

.question__edit-name {
  transition: all 0.2s;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
  font-size: 1.6em;
  color: var(--text-primary-color);
  outline: none;
}

.question__edit-tags {
  transition: all 0.2s;
  margin-right: 0.5em;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--accent-color);
  font-size: 1.2em;
  color: var(--text-primary-color);
  outline: none;
}

.question__edit-content {
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

.question__edit-name:focus,
.question__edit-tags:focus,
.question__edit-content:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.question__edit-content::placeholder {
  font-family: inherit;
}

.question__btn--edit {
  transition: all 0.2s;
  display: block;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--btn-color);
  border-radius: 2rem;
  background-color: var(--btn-color);
  color: #eee;
  font-size: 1.2rem;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
}

.question__btn--edit:hover {
  background-color: var(--background-color-secondary);
  color: var(--btn-color);
}

.question__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.4);
}

.question__modal-box {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  padding: 2rem;
  border-radius: 1rem;
  background-color: var(--accent-color);
  color: var(--text-primary-color);
  text-align: center;
}

.question__modal-content {
  margin-top: 3rem;
  font-size: 1.8em;
  text-align: center;
}

.question__modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3;
  height: 3rem;
  color: var(--text-primary-color);
  cursor: pointer;
}

.question__modal-btn {
  transition: all 0.2s;
  margin-top: 2.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid #ff3636;
  border-radius: 2rem;
  background-color: #ff3636;
  color: #eee;
  font-size: 1.2em;
  text-transform: uppercase;
  font-weight: 600;
  cursor: pointer;
}

.question__modal-btn:hover {
  border: 2px solid #ff3636;
  background-color: var(--accent-color);
  color: #ff3636;
}

@media screen and (max-width: 768px) {
  .question {
    padding: 1rem 2rem;
  }

  .answers {
    padding: 1.5rem 2rem;
  }

  .question__btns {
    right: 0;
  }
}

@media screen and (max-width: 500px) {
  .question__owner-date {
    width: 70%;
    font-size: 1.1rem;
  }
}
</style>
