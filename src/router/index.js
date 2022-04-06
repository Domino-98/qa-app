import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import AddQuestion from "../views/AddQuestion.vue";
import Question from "../views/Question.vue";
import { supabase } from "../supabase/supabase";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/add-question",
    name: "AddQuestion",
    component: AddQuestion,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/question/:id",
    name: "Question",
    component: Question,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = supabase.auth.user();
  if (!user && to.meta.requiresAuth) {
    return next("/login");
  }
  next();
});

export default router;
