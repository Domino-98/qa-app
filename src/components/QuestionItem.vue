<script setup>
import { ref, defineProps } from "vue";
import { supabase } from "../supabase/supabase";
import { useStore } from "vuex";
import timeSince from "../shared";

const store = useStore();
const user = supabase.auth.user();

const props = defineProps({
  question: Object,
});

function displayVoteError() {
  if (!user) {
    store.commit(
      "errorMsg",
      "Musisz być zalogowany by móc zagłosować na pytanie!"
    );
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  } else if (props.question.owner_user_id === user.id) {
    store.commit("errorMsg", "Nie możesz głosować na swoje pytania!");
    setTimeout(() => {
      store.commit("errorMsg", "");
    }, 3000);
  }
}

// Upvote question
async function upvoteQuestion(question) {
  displayVoteError();
  if (user && question.owner_user_id !== user.id) {
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
  displayVoteError();
  if (user && question.owner_user_id !== user.id) {
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
</script>

<template>
  <li class="questions__item">
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
        <span class="display-name">{{ question.owner_display_name }}</span>
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
          @click="$emit('filterByTag', tag)"
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
            >{{ question.answersWithoutParent.length }} odpowiedzi,</span
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
</template>

<style scoped>
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

.display-name {
  display: inline-block;
  margin: 0 0.5rem;
  color: var(--primary-color);
}
</style>
