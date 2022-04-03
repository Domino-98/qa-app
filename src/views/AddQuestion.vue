<script setup>
import { ref, reactive } from "vue";
import { uid } from "uid";

let tag = ref("");
let newTag = "";
let errorMsg = ref("");

const question = reactive({
  id: uid(),
  name: "",
  content: "",
  tags: [],
  timestamp: new Date(),
  answer_count: 0,
  view_count: 0,
  score: 0,
  owner_display_name: "Dominik",
});

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
  console.log(question);
}

function addQuestion() {
  pushToTags();
  console.log(question);
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
          v-model="question.name"
          id="question-name"
          type="text"
          class="form__question-input"
          required
        />
      </div>
      <div class="form__question-group">
        <label for="question-content" class="form__question-label"
          >Treść pytania</label
        >
        <textarea
          v-model="question.content"
          id="question-content"
          name="question-content"
          rows="5"
          class="form__question-content"
          required
        ></textarea>
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
            <span class="form__question-tag-delete">x</span>
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
  margin-top: 5rem;
}

.form__question {
  width: 100%;
  max-width: 45rem;
  padding: 3rem;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 8px;
}

.form__question-header {
  font-size: 2.6rem;
  font-weight: 400;
}

.form__question-group {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 1.5rem 0;
}

.form__question-group:first-of-type {
  margin-top: 3rem;
}

.form__question-label {
  font-size: 1.4rem;
  font-weight: 400;
  color: #0084ff;
}

.form__question-input {
  margin-top: 0.5rem;
  font-size: 1.6em;
  padding: 1rem;
  outline: none;
  border: none;
  background-color: #eee;
  transition: all 0.2s;
}

.form__question-content {
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

.form__question-input:focus,
.form__question-content:focus {
  box-shadow: 0px 0.2rem 0.5rem #74747466;
}

.form__question-btn {
  display: block;
  margin: 1rem auto 0 auto;
  border: 2px solid #0084ff;
  background-color: #0084ff;
  color: #fff;
  border-radius: 2rem;
  padding: 1rem 2rem;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: 600;
  transition: all 0.2s;
}

.form__question-btn:hover {
  background: none;
  border: 2px solid #0084ff;
  background-color: #fff;
  color: #0084ff;
}

.form__question-tags {
  display: flex;
  flex-wrap: wrap;
}

.form__question-tag {
  display: inline-block;
  margin-top: 1rem;
  text-decoration: none;
  color: #fff;
  background-color: #00a2ff;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.form__question-tag-delete {
  color: #fff;
}

.error-msg {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #ff4a4a;
}
</style>
