<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

function scrollToTop() {
  window.scrollTo(0, 0);
}

const store = useStore();
const route = useRoute();
const user = computed(() => store.state.user);

let menuOpened = ref(false);
let search = ref("");

// Sign out user
function signOut() {
  menuOpened.value = !menuOpened.value;
  store.dispatch("signOutAction");
  console.log(user);
}

function displayError() {
  store.commit("errorMsg", "Musisz być zalogowany by móc dodać pytanie!");
  setTimeout(() => {
    store.commit("errorMsg", "");
  }, 3000);
}

// Dark mode
let dark = ref(false);

const setTheme = (theme) => {
  localStorage.setItem("user-theme", theme);
  userTheme.value = theme;
  document.documentElement.className = theme;
};

const getTheme = () => {
  const activeTheme = localStorage.getItem("user-theme");
  if (activeTheme === "light") {
    dark.value = false;
  } else {
    dark.value = true;
  }
  return localStorage.getItem("user-theme");
};

const toggleTheme = () => {
  dark.value = !dark.value;
  const activeTheme = localStorage.getItem("user-theme");
  if (activeTheme === "light") {
    setTheme("dark");
  } else {
    setTheme("light");
  }
};

const getMediaPreference = () => {
  const hasDarkPreference = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (hasDarkPreference) {
    return "dark";
  } else {
    return "light";
  }
};

const userTheme = ref(getTheme() || getMediaPreference());

onMounted(() => setTheme(userTheme.value));

const emitter = inject("emitter");

function emitSearch(search) {
  emitter.emit("searchQuestions", { submitted: true, searchValue: search });
}
</script>

<template>
  <header class="header">
    <nav class="nav container">
      <router-link
        @click.prevent="menuOpened = false"
        @click.native="scrollToTop"
        :to="{ name: 'Home' }"
        class="nav__logo"
        ><img
          class="nav__logo-icon"
          src="../assets/communication.png"
        />Q&A</router-link
      >
      <!-- Dark mode -->
      <svg
        class="dark-mode-btn"
        viewBox="0 0 189 88"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :class="{ dark: dark }"
      >
        <!-- Generator: Sketch 63.1 (92452) - https://sketch.com -->
        <defs>
          <circle id="path-1" cx="25" cy="25" r="25"></circle>
        </defs>
        <g
          @click="toggleTheme"
          id="Page-1"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g id="dark-mode-toggle">
            <rect
              id="bg"
              fill="#364050"
              fill-rule="nonzero"
              x="0"
              y="0"
              width="189"
              height="88"
              rx="44"
            ></rect>
            <circle
              id="main-circle"
              fill="#FFFFFF"
              fill-rule="nonzero"
              cx="46"
              cy="44"
              r="25"
            ></circle>
            <g id="moon-accents" transform="translate(21.000000, 19.000000)">
              <mask id="mask-2" fill="white">
                <use xlink:href="#path-1"></use>
              </mask>
              <use id="Mask" fill-rule="nonzero" xlink:href="#path-1"></use>
              <circle
                id="moon-accent-2"
                fill="#EEEEEE"
                fill-rule="nonzero"
                mask="url(#mask-2)"
                cx="44"
                cy="23"
                r="11"
              ></circle>
              <circle
                id="moon-accent-1"
                fill="#EEEEEE"
                fill-rule="nonzero"
                mask="url(#mask-2)"
                cx="9"
                cy="8"
                r="7"
              ></circle>
              <circle
                id="moon-accent-3"
                fill="#EEEEEE"
                fill-rule="nonzero"
                mask="url(#mask-2)"
                cx="9"
                cy="38"
                r="10"
              ></circle>
              <circle
                id="moon-accent-4"
                fill="#EEEEEE"
                fill-rule="nonzero"
                mask="url(#mask-2)"
                cx="24"
                cy="15"
                r="6"
              ></circle>
              <circle
                id="moon-accent-5"
                fill="#EEEEEE"
                fill-rule="nonzero"
                mask="url(#mask-2)"
                cx="31.5"
                cy="39.5"
                r="3.5"
              ></circle>
            </g>
            <g
              id="stars"
              transform="translate(89.000000, 18.000000)"
              fill="#FFFFFF"
            >
              <polygon
                id="Star"
                points="6.5 9.75 2.67939586 11.7586105 3.40906632 7.50430523 0.318132644 4.49138954 4.58969793 3.87069477 6.5 0 8.41030207 3.87069477 12.6818674 4.49138954 9.59093368 7.50430523 10.3206041 11.7586105"
              ></polygon>
              <polygon
                id="Star-Copy"
                points="21 43 15.1221475 46.0901699 16.2447174 39.545085 11.4894348 34.9098301 18.0610737 33.954915 21 28 23.9389263 33.954915 30.5105652 34.9098301 25.7552826 39.545085 26.8778525 46.0901699"
              ></polygon>
              <polygon
                id="Star-Copy-2"
                points="52 8 49.648859 9.23606798 50.097887 6.61803399 48.1957739 4.76393202 50.8244295 4.38196601 52 2 53.1755705 4.38196601 55.8042261 4.76393202 53.902113 6.61803399 54.351141 9.23606798"
              ></polygon>
              <polygon
                id="Star-Copy-3"
                points="60 31 56.4732885 32.854102 57.1468305 28.927051 54.2936609 26.145898 58.2366442 25.572949 60 22 61.7633558 25.572949 65.7063391 26.145898 62.8531695 28.927051 63.5267115 32.854102"
              ></polygon>
            </g>
            <g
              id="clouds"
              transform="translate(24.000000, 17.000000)"
              fill="#FFFFFF"
              fill-rule="nonzero"
            >
              <path
                d="M22.4581401,8.64610504 C22.458794,8.60836037 22.4595787,8.57068044 22.4595787,8.53280628 C22.4595787,4.92485595 19.5054963,2 15.8614938,2 C12.7211834,2 10.0935887,4.17216375 9.42701247,7.08174056 C8.80548929,6.7372476 8.08954429,6.53997828 7.32658453,6.53997828 C4.9459644,6.53997828 3.01613657,8.45077798 3.01613657,10.8077806 C3.01613657,10.9041169 3.02051764,10.9993526 3.02686038,11.0941351 C1.2595244,11.743693 0,13.42796 0,15.4038903 C0,17.9422356 2.07832643,20 4.64203597,20 L21.1974387,20 C24.402092,20 27,17.4277945 27,14.2548467 C27,11.5105566 25.0565712,9.2160949 22.4581401,8.64610504 Z"
                id="Path"
              ></path>
              <path
                d="M75.4581401,38.646105 C75.458794,38.6083604 75.4595787,38.5706804 75.4595787,38.5328063 C75.4595787,34.9248559 72.5054963,32 68.8614938,32 C65.7211834,32 63.0935887,34.1721638 62.4270125,37.0817406 C61.8054893,36.7372476 61.0895443,36.5399783 60.3265845,36.5399783 C57.9459644,36.5399783 56.0161366,38.450778 56.0161366,40.8077806 C56.0161366,40.9041169 56.0205176,40.9993526 56.0268604,41.0941351 C54.2595244,41.743693 53,43.42796 53,45.4038903 C53,47.9422356 55.0783264,50 57.642036,50 L74.1974387,50 C77.402092,50 80,47.4277945 80,44.2548467 C80,41.5105566 78.0565712,39.2160949 75.4581401,38.646105 Z"
                id="Path-Copy-2"
              ></path>
              <path
                d="M37.4466786,38.851297 C37.1439054,38.851297 36.8417385,38.8815517 36.5450288,38.9418581 C36.3212839,37.8199968 35.5979024,36.8630135 34.5822578,36.3450283 C33.5668154,35.8270431 32.3708814,35.8053165 31.3372484,36.2859402 C30.4018448,33.6974356 27.5548062,32.3609484 24.978202,33.3006723 C22.4015977,34.2403961 21.071255,37.1007872 22.0066586,39.6890888 C19.7496033,39.7607661 17.9667177,41.6375741 18.0004714,43.905866 C18.0344273,46.1743611 19.8726934,47.9963451 22.1309613,48 L37.4466786,48 C39.9612326,48 42,45.9520193 42,43.4256485 C42,40.8992777 39.9612326,38.851297 37.4466786,38.851297 Z"
                id="Path"
              ></path>
              <path
                d="M56.585009,4.2909511 C56.357929,4.2909511 56.1313039,4.31313789 55.9087716,4.3573626 C55.7409629,3.5346643 55.1984268,2.83287655 54.4366934,2.45302076 C53.6751116,2.07316494 52.778161,2.05723213 52.0029363,2.4096895 C51.3013836,0.511452738 49.1661047,-0.468637832 47.2336515,0.22049299 C45.3011983,0.909623811 44.3034412,3.00724393 45.0049939,4.9053318 C43.3122025,4.95789514 41.9750383,6.33422103 42.0003536,7.99763509 C42.0258205,9.66119812 43.40452,10.9973197 45.098221,11 L56.585009,11 C58.4709244,11 60,9.4981475 60,7.64547555 C60,5.79280364 58.4709244,4.2909511 56.585009,4.2909511 Z"
                id="Path-Copy"
              ></path>
            </g>
          </g>
        </g>
      </svg>

      <button
        class="menu-btn"
        @click.prevent="menuOpened = !menuOpened"
        :class="{ opened: menuOpened }"
        aria-label="Main Menu"
      >
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path
            class="line line1"
            d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
          />
          <path class="line line2" d="M 20,50 H 80" />
          <path
            class="line line3"
            d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
          />
        </svg>
      </button>

      <Transition>
        <div
          class="menu-overlay"
          @click.self="menuOpened = !menuOpened"
          v-show="menuOpened"
        ></div>
      </Transition>
      <Transition name="show">
        <ul class="menu" v-show="menuOpened">
          <form
            v-show="route.name === 'Home'"
            class="menu__search"
            @submit.prevent="emitSearch(search), (menuOpened = !menuOpened)"
          >
            <input
              v-model="search"
              type="text"
              class="menu__search-input"
              placeholder="Wyszukaj pytanie"
              required
            />
            <button type="submit" class="menu__search-btn">
              <svg type="" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                />
              </svg>
            </button>
          </form>
          <router-link
            @click.prevent="menuOpened = !menuOpened"
            @click.native="scrollToTop"
            :to="{ name: 'Home' }"
            class="menu__item"
            >Strona główna</router-link
          >
          <router-link
            @click.prevent="
              !user ? displayError() : null, (menuOpened = !menuOpened)
            "
            :to="{ name: 'AddQuestion' }"
            class="menu__item"
            >Zadaj pytanie</router-link
          >
          <router-link
            @click.prevent="menuOpened = !menuOpened"
            v-if="!user"
            :to="{ name: 'Login' }"
            class="menu__item"
            >Zaloguj się</router-link
          >
          <a v-if="user" href="#" class="menu__item" @click.prevent="signOut"
            >Wyloguj się</a
          >
        </ul>
      </Transition>

      <div class="nav__btns">
        <router-link
          :to="{ name: 'Home' }"
          class="nav__btn"
          @click.native="scrollToTop"
          >Strona główna</router-link
        >
        <router-link
          @click.prevent="!user ? displayError() : null"
          :to="{ name: 'AddQuestion' }"
          class="nav__btn"
          >Zadaj pytanie</router-link
        >
        <router-link v-if="!user" :to="{ name: 'Login' }" class="nav__btn"
          >Zaloguj się</router-link
        >
        <a v-if="user" href="#" class="nav__btn" @click.prevent="signOut"
          >Wyloguj się</a
        >
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0px;
  z-index: 100;
  transition: background-color 0.2s;
  width: 100%;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2);
  background-color: var(--background-color-primary);
}

.nav {
  display: flex;
  align-items: center;
  width: 100%;
  margin: auto;
  padding: 1rem 0rem;
}

.nav__logo {
  display: flex;
  align-items: center;
  margin-right: auto;
  background: -webkit-linear-gradient(rgb(0, 140, 255), rgb(0, 211, 218));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.6rem;
  text-decoration: none;
}

.nav__logo-icon {
  width: 4.5rem;
  margin-right: 1rem;
}

.nav__btns {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__btn {
  transition: all 0.2s;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
  text-decoration: none;
  color: var(--text-primary-color);
  font-size: 1.6rem;
}

.nav__btn:not(:last-child) {
  margin-right: 1rem;
}

.nav__btn:hover {
  background-color: var(--btn-color);
  color: #fff;
}

#bg,
#stars,
#clouds,
#main-circle,
#moon-accents {
  transition: all 0.3s ease-out;
}
/* BACKGROUND */
svg:not(.dark) #bg {
  fill: #47cfff;
}
/* SUN STYLES */
svg:not(.dark) #main-circle {
  transform: translateX(10rem);
  fill: #fee253;
}
/* HIDE MOON ACCENTS FOR LIGHT */
svg:not(.dark) #moon-accents {
  opacity: 0;
}
/* HIDE STARS ON LIGHT MODE */
svg:not(.dark) #stars {
  opacity: 0;
}
/* HIDE CLOUDS ON DARK MODE */
svg.dark #clouds {
  opacity: 0;
}

.dark-mode-btn {
  width: 5rem;
  height: 4.5rem;
  margin-right: 1rem;
}
.dark-mode-btn g {
  cursor: pointer;
}

.menu-btn {
  display: none;
  width: 4.5rem;
  height: 4.5rem;
  border: none;
  padding: 0;
  cursor: pointer;
  background-color: transparent;
  z-index: 10;
}

.line {
  fill: none;
  stroke: var(--text-primary-color);
  stroke-width: 6;
  transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
    stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
}
.line1 {
  stroke-dasharray: 60 207;
  stroke-width: 5;
}
.line2 {
  stroke-dasharray: 60 60;
  stroke-width: 5;
}
.line3 {
  stroke-dasharray: 60 207;
  stroke-width: 5;
}
.opened .line1 {
  stroke-dasharray: 90 207;
  stroke-dashoffset: -134;
  stroke-width: 5;
}
.opened .line2 {
  stroke-dasharray: 1 60;
  stroke-dashoffset: -30;
  stroke-width: 5;
}
.opened .line3 {
  stroke-dasharray: 90 207;
  stroke-dashoffset: -134;
  stroke-width: 5;
}

.menu-overlay {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: none;
  background-color: rgba(0, 0, 0, 0.4);
}

.menu {
  position: fixed;
  top: 0;
  right: 0;
  display: none;
  transform: translateX(0);
  transition: all 0.25s;
  width: 27.5rem;
  height: 100%;
  margin: 0;
  padding: 8rem 0;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  background-color: var(--background-color-primary);
  list-style: none;
}

.menu__item {
  display: block;
  transition: all 0.25s;
  padding: 1.2rem 2.4rem;
  color: var(--text-primary-color);
  font-size: 2rem;
  font-weight: 600;
  text-decoration: none;
}

.menu__item:hover {
  background-color: var(--accent-color);
}

.menu__search {
  position: relative;
  flex: 3;
  padding: 1.2rem 2.4rem;
}

.menu__search-input {
  transition: all 0.2s;
  width: 100%;
  padding: 1rem;
  padding-right: 3.5rem;
  border-radius: 1rem;
  border: none;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
  background-color: var(--accent-color);
  color: var(--text-primary-color);
  font-size: 1.6rem;
}

.menu__search-input:focus {
  outline: none;
}

.menu__search-btn {
  position: absolute;
  width: 2.5rem;
  height: 2.5rem;
  right: 3.25rem;
  top: 2rem;
  border: none;
  background-color: transparent;
  color: var(--primary-color);
}

.show-enter-from,
.show-leave-to {
  transform: translateX(100%);
}

.show-enter-to,
.show-leave-from {
  transform: translateX(0%);
}

.show-enter-active {
  transition: all 0.3s ease-in-out;
}

@media screen and (max-width: 1024px) {
  .nav {
    padding: 1rem 2rem;
  }
}

@media screen and (max-width: 600px) {
  .dark-mode-btn {
    margin-right: 2.5rem;
  }

  .nav__btns {
    display: none;
  }

  .menu-btn {
    display: flex;
  }

  .menu {
    display: block;
  }

  .menu-overlay {
    display: block;
  }
}
</style>
