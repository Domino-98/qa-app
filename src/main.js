import { createApp } from "vue";
import mitt from "mitt";
import router from "./router/index";
import store from "./store/index";
import App from "./App.vue";

const emitter = mitt();

const app = createApp(App);
app.provide("emitter", emitter);
app.use(router).use(store).mount("#app");
