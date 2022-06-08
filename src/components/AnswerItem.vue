<script setup>
import { ref } from "vue";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import timeSince from "../shared";

const store = useStore();
const route = useRoute();
const user = supabase.auth.user();

const props = defineProps({
  answers: Array,
  answer: Object,
  username: String,
  canChooseAnswer: Boolean,
});

const emit = defineEmits(["getAnswers"]);

function displayVoteError() {
  if (!user) {
    store.commit(
      "errorMsg",
      "Musisz być zalogowany by móc zagłosować na odpowiedź!"
    );
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  } else if (props.answer.user_id === user.id) {
    store.commit("errorMsg", "Nie możesz głosować na swoje odpowiedzi!");
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  }
}

// Upvote answer
async function upvoteAnswer(answer) {
  displayVoteError();
  if (user && answer.user_id !== user.id) {
    try {
      const { data: upvoted, error } = await supabase
        .from("votes_answer")
        .select("upvoted")
        .is("upvoted", true)
        .match({ answer_id: answer.id, user_id: user.id });

      if (upvoted[0]) {
        try {
          const { error, data } = await supabase.from("votes_answer").upsert(
            {
              answer_id: answer.id,
              user_id: user.id,
              question_id: route.params.id,
              upvoted: false,
            },
            { onConflict: "answer_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          answer.upvoted = false;
          answer.score--;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const { error, data } = await supabase.from("votes_answer").upsert(
            {
              answer_id: answer.id,
              user_id: user.id,
              question_id: route.params.id,
              upvoted: true,
              downvoted: false,
            },
            { onConflict: "answer_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          if (answer.downvoted) {
            answer.score += 2;
          } else {
            answer.score++;
          }
          answer.upvoted = true;
          answer.downvoted = false;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

// Downvote answer
async function downvoteAnswer(answer) {
  displayVoteError();
  if (user && answer.user_id !== user.id) {
    try {
      const { data: downvoted, error } = await supabase
        .from("votes_answer")
        .select("downvoted")
        .is("downvoted", true)
        .match({ answer_id: answer.id, user_id: user.id });

      if (downvoted[0]) {
        try {
          const { error, data } = await supabase.from("votes_answer").upsert(
            {
              answer_id: answer.id,
              user_id: user.id,
              question_id: route.params.id,
              downvoted: false,
            },
            { onConflict: "answer_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          answer.downvoted = false;
          answer.score++;
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const { error, data } = await supabase.from("votes_answer").upsert(
            {
              answer_id: answer.id,
              user_id: user.id,
              question_id: route.params.id,
              downvoted: true,
              upvoted: false,
            },
            { onConflict: "answer_id,user_id" }
          );
          if (error) {
            console.log(error);
          }
          if (answer.upvoted) {
            answer.score -= 2;
          } else {
            answer.score--;
          }
          answer.downvoted = true;
          answer.upvoted = false;
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

// Edit mode
function editA(answerId) {
  props.answers.forEach((answer) => {
    if (answer.id === answerId) {
      return (answer.editMode = !answer.editMode);
    }
  });
}

// Edit answer
async function editAnswer(answerId, answerContent) {
  try {
    const { data, error } = await supabase
      .from("answers")
      .update({
        content: answerContent,
      })
      .match({ id: answerId });

    store.commit("successMsg", "Odpowiedź została zedytowana!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);

    props.answers.forEach((answer) => {
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
  // Delete answer votes
  try {
    const { data, error } = await supabase
      .from("votes_answer")
      .delete()
      .eq("answer_id", answerId);
    if (error) {
      store.commit("errorMsg", error.message);
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
  // Delete replies
  try {
    const { data, error } = await supabase
      .from("answers")
      .delete()
      .eq("parent_id", answerId);

    if (error) {
      store.commit("errorMsg", error.message);
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
  // Delete answer
  try {
    const { data, error } = await supabase
      .from("answers")
      .delete()
      .eq("id", answerId);

    if (error) {
      store.commit("errorMsg", error.message);
      throw error;
    }
    store.commit("successMsg", "Odpowiedź została usunięta!");
    setTimeout(() => {
      store.commit("successMsg", "");
    }, 3000);
    emit("getAnswers");
  } catch (error) {
    console.log(error);
  }
}

let username = ref("");

// Reply to answer
async function addReply(event, answer) {
  if (!user) {
    store.commit("errorMsg", "Musisz być zalogowany by móc dodać komentarz!");
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
    // Add reply
    try {
      const { error } = await supabase.from("answers").insert([
        {
          parent_id: answer.id,
          user_id: user.id,
          question_id: route.params.id,
          created_at: new Date(),
          content: event.target[0].value,
          user_display_name: username.value,
        },
      ]);

      emit("getAnswers");
      event.target[0].value = "";
      console.log(answer.content);
    } catch (error) {
      console.log(error);
    }
  }
}
</script>

<template>
  <li class="answers__item" :class="{ 'best-answer': answer.accepted_answer }">
    <div class="answers__item-votes">
      <div>
        <svg
          v-if="!answer.upvoted"
          @click.prevent="upvoteAnswer(answer)"
          class="answers__item-votes-icon answers__item-votes-icon--up"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
          />
        </svg>
        <svg
          v-else
          @click.prevent="upvoteAnswer(answer)"
          class="answers__item-votes-icon answers__item-votes-icon--up"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z"
          />
        </svg>
      </div>
      <div class="answers__item-votes-score">
        <span>{{ answer.score }}</span>
      </div>
      <div>
        <svg
          v-if="!answer.downvoted"
          @click.prevent="downvoteAnswer(answer)"
          class="answers__item-votes-icon answers__item-votes-icon--down"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z"
          />
        </svg>
        <svg
          v-else
          @click.prevent="downvoteAnswer(answer)"
          class="answers__item-votes-icon answers__item-votes-icon--down"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z"
          />
        </svg>
      </div>
    </div>
    <div class="answers__content">
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
          class="answers__input answers__input--edit"
          name="answer"
          id="answer"
          rows="3"
          placeholder="Treść odpowiedzi"
          required
        ></textarea>
        <button v-if="answer.editMode" class="answers__btn answers__btn--edit">
          Edytuj odpowiedź
        </button>
      </form>

      <div class="answers__info">
        <svg
          v-if="
            canChooseAnswer &&
            answer.user_id != user.id &&
            !answer.accepted_answer
          "
          class="answers__best-btn"
          viewBox="0 0 24 24"
          @click="$emit('bestAnswer', answer)"
        >
          <title>Zaznacz jako najlepszą odpowiedź</title>
          <path
            fill="currentColor"
            d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"
          />
        </svg>
        <svg
          v-if="answer.accepted_answer"
          @click.prevent="$emit('bestAnswer', answer)"
          class="answers__best"
          viewBox="0 0 24 24"
        >
          <title>Najlepsza wybrana odpowiedź</title>
          <path
            fill="currentColor"
            d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
          />
        </svg>
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
          Odpowiedź dodana przez
          <span class="display-name">{{ answer.user_display_name }}</span>
          {{
            timeSince(
              new Date(
                Date.now() -
                  (new Date().getTime() - new Date(answer.created_at).getTime())
              )
            )
          }}
          temu,
          {{ new Date(answer.created_at).toLocaleDateString() }},
          {{
            new Date(answer.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          }}
        </p>
      </div>
      <form
        v-show="answer.textEditOpen"
        class="replies__add"
        @submit.prevent="
          addReply($event, answer), (answer.textEditOpen = !answer.textEditOpen)
        "
      >
        <textarea
          class="replies__input"
          name="replies"
          id="replies"
          rows="4"
          required
        ></textarea>
        <button class="replies__btn" type="submit">Dodaj komentarz</button>
      </form>
      <div class="reply">
        <button
          @click.prevent="answer.textEditOpen = !answer.textEditOpen"
          class="reply__btn"
          type="submit"
        >
          Skomentuj
        </button>
        <button
          :class="{ replied: answer.replies.length > 0 }"
          title="Pokaż sekcje komentarzy"
          @click.prevent="answer.showComments = !answer.showComments"
          class="reply__info"
        >
          {{ answer.replies.length }} komentarzy
        </button>
      </div>
    </div>
    <ul class="replies__list">
      <transition-group name="list">
        <li
          v-show="answer.showComments"
          v-for="reply in answer.replies"
          :key="reply.id"
          class="replies__item"
        >
          <form
            class="replies__content"
            @submit.prevent="editAnswer(reply.id, reply.content)"
          >
            <p
              style="white-space: pre-wrap"
              v-if="!reply.editMode"
              class="replies__item-content"
            >
              {{ reply.content }}
            </p>
            <textarea
              v-else
              v-model="reply.content"
              class="replies__input replies__input--edit"
              name="reply"
              id="reply"
              rows="5"
              placeholder="Treść odpowiedzi"
              required
            ></textarea>
            <button
              v-if="reply.editMode"
              class="replies__btn replies__btn--edit"
            >
              Edytuj komentarz
            </button>
          </form>

          <div class="replies__info">
            <p>
              Komentarz dodany przez
              <span class="display-name">{{ reply.user_display_name }}</span>
              {{
                timeSince(
                  new Date(
                    Date.now() -
                      (new Date().getTime() -
                        new Date(reply.created_at).getTime())
                  )
                )
              }}
              temu,
              {{ new Date(reply.created_at).toLocaleDateString() }},
              {{
                new Date(reply.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
            <div v-if="reply.editable" class="replies__btns">
              <button
                @click.prevent="editA(reply.id)"
                class="replies__edit"
                title="Edytuj komentarz"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11 20V22H3C1.9 22 1 21.1 1 20V4C1 2.9 1.9 2 3 2H21C22.1 2 23 2.9 23 4V12.1L22.8 11.9C22.3 11.4 21.7 11.1 21 11.1V6H3V20H11M21.4 13.3L22.7 14.6C22.9 14.8 22.9 15.2 22.7 15.4L21.7 16.4L19.6 14.3L20.6 13.3C20.7 13.2 20.8 13.1 21 13.1C21.2 13.1 21.3 13.2 21.4 13.3M21.1 16.9L15.1 23H13V20.9L19.1 14.8L21.1 16.9Z"
                  />
                </svg>
              </button>
              <button
                @click.prevent="deleteAnswer(reply.id)"
                class="replies__delete"
                title="Usuń komentarz"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </transition-group>
    </ul>
  </li>
</template>

<style scoped>
.answers__item-votes {
  align-self: flex-start;
  margin-right: 2rem;
  color: var(--text-primary-color);
}

.answers__item-votes-score {
  text-align: center;
  font-size: 2rem;
  font-weight: 400;
}

.answers__item-votes-icon {
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
}

.answers__item-votes-icon--up {
  color: #3ed73e;
}

.answers__item-votes-icon--down {
  color: #ff3a3a;
}

.answers__content {
  flex-basis: calc(100% - 9rem);
}

.answers__item {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 2rem 0;
  border-top: 2px solid var(--accent-color);
  list-style-type: none;
}

.answers__item:first-child {
  margin-top: 1.25rem;
}

.answers__item:first-child {
  border-top: none;
}

.answers__item-content,
.replies__item-content {
  padding-right: 11.25rem;
  font-size: 1.6rem;
  color: var(--text-primary-color);
  word-break: break-all;
}

.replies__item-content {
  font-size: 1.3rem;
}

.replies__list {
  flex-basis: 100%;
  margin-left: 5rem;
  overflow: hidden;
}

.replies__item {
  position: relative;
  width: -moz-calc(50% - 5rem);
  width: calc(50% - 5rem);
  border-top: 2px solid var(--accent-color);
  margin-top: 0.5rem;
  margin-left: 3rem;
  padding: 1rem 0;
  list-style-type: none;
}

.replies__item:first-child {
  margin-top: 1.5rem;
  border-top: none;
}
.answers__info {
  margin-top: 1.25rem;
  color: #7f7f7f;
  font-size: 1.1rem;
}

.replies__info {
  display: flex;
  align-items: flex-end;
  margin-top: 1.25rem;
  color: #7f7f7f;
  font-size: 1.1rem;
}

.display-name {
  color: var(--primary-color);
}

.answers__add,
.replies__add {
  display: flex;
  flex-direction: column;
}

.replies__add {
  margin-top: 1.25rem;
}

.answers__label {
  color: var(--text-primary-color);
  font-size: 1.4rem;
}

.answers__input,
.replies__input {
  width: 100%;
  transition: all 0.2s;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  padding: 1rem;
  border: none;
  background-color: var(--accent-color);
  color: var(--text-primary-color);
  font-size: 1.6rem;
  font-family: inherit;
  outline: none;
  resize: none;
}

.answers__input:focus,
.answers__input-edit:focus,
.replies__input:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.answers__btn,
.replies__btn {
  align-self: start;
  transition: all 0.2s;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  border: 2px solid var(--btn-color);
  background-color: var(--btn-color);
  color: #eee;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
}

.answers__input--edit {
  width: 100%;
}

.replies__input {
  width: 25rem;
  font-size: 1.3rem;
}

.replies__input--edit {
  width: 20rem;
}

.replies__content {
  display: flex;
  flex-direction: column;
}

.answers__btn:hover,
.replies__btn:hover {
  background-color: var(--background-color-secondary);
  color: var(--btn-color);
}

.answers__btns {
  position: absolute;
  z-index: 10;
  bottom: 1rem;
  right: 1rem;
}

.replies__btns {
  position: absolute;
  z-index: 5;
  top: 0.5rem;
  right: 0.5rem;
}

.answers__edit,
.answers__delete,
.replies__edit,
.replies__delete {
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

.replies__edit,
.replies__delete {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
}

.answers__edit:hover,
.answers__delete:hover,
.replies__edit:hover,
.replies__delete:hover {
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  background-color: var(--accent-color);
  color: var(--text-primary-color);
}

.answers__best-btn,
.answers__best {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  transition: all 0.3s;
  width: 4rem;
  height: 4rem;
  color: #3ed73e;
  cursor: pointer;
}

.answers__best-btn:hover {
  color: #51ff51;
}

.best-answer {
  padding: 1.5rem;
  border: 2px solid #51ff51;
  border-radius: 1rem;
  background-image: linear-gradient(
    to bottom right,
    rgba(0, 255, 35, 0.1),
    rgba(0, 100, 10, 0.1)
  );
}

.best-answer:first-child {
  border-top: 2px solid #51ff51;
  border-radius: 1rem;
}

.best-answer + li {
  border-top: none;
}

.reply {
  display: flex;
}

.reply__btn,
.reply__info {
  display: block;
  transition: all 0.2s;
  margin-top: 1.25rem;
  margin-right: 1.25rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--btn-color);
  border-radius: 1.5rem;
  background-color: var(--btn-color);
  color: #eee;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.replied {
  display: block;
  transition: all 0.5s ease-in-out;
  margin-top: 1.25rem;
  margin-right: 1.25rem;
  border: 2px solid transparent;
  padding: 0.5rem 0.75rem;
  border-radius: 1.5rem;
  box-shadow: 0 1px 5px 0 rgba(255, 79, 20, 0.75);
  background-size: 500% 100%;
  background-position: 10% 0;
  background-image: linear-gradient(
    to right,
    #ff4912,
    #ff9857,
    #ff9857,
    #ff4912
  );
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  color: #eee;
  cursor: pointer;
}

.reply__btn:hover,
.reply__info:hover {
  border: 2px solid var(--btn-color);
  background-color: var(--background-color-secondary);
  color: var(--btn-color);
}

.replied:hover {
  border: 2px solid transparent;
  background-position: 90% 0;
  color: #eee;
}

@media screen and (max-width: 768px) {
  .replies__input--edit {
    width: 17.5rem;
  }
}

@media screen and (max-width: 600px) {
  .replies__item {
    width: 100%;
  }

  .replies__btns {
    top: 0.5rem;
    right: 3.5rem;
  }

  .replies__info {
    width: 50%;
  }

  .answers__edit,
  .answers__delete {
    width: 3.5rem;
    height: 3.5rem;
    padding: 1rem;
    background-color: var(--manage-btn-bg-color);
  }
}
</style>
