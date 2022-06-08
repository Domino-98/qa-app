import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import Cookies from "js-cookie";
import router from "../router/index";
import { supabase } from "../supabase/supabase";

// Create store
export default createStore({
  state: {
    user: null,
    errorMsg: "",
    successMsg: "",
    loading: false,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    errorMsg(state, payload) {
      state.errorMsg = payload;
    },
    successMsg(state, payload) {
      state.successMsg = payload;
    },
    loading(state, status) {
      state.loading = status;
    },
  },
  actions: {
    async signInAction({ commit }, form) {
      commit("loading", true);
      try {
        const { error, user } = await supabase.auth.signIn({
          email: form.email,
          password: form.password,
        });
        if (error) {
          commit("errorMsg", error.message);
          setTimeout(() => {
            commit("errorMsg", "");
          }, 5000);
          commit("loading", false);
          throw error;
        }
        await router.push("/");
        commit("setUser", user);
        commit("successMsg", "Pomyślnie zalogowano!");
        setTimeout(() => {
          commit("successMsg", "");
        }, 3000);
      } catch (error) {
        console.log(error);
      }
      commit("loading", false);
    },
    async signUpAction({ dispatch, commit }, form) {
      commit("loading", true);
      // Check if username already exists
      try {
        const { data: username, error } = await supabase
          .from("users")
          .select("username")
          .eq("username", form.username)
          .single();

        if (username) {
          commit("errorMsg", "Podana nazwa użytkownika już istnieje!");
          setTimeout(() => {
            commit("errorMsg", "");
          }, 5000);
          commit("loading", false);
          return;
        }
        if (error) {
          commit("errorMsg", error.msg);
          throw error;
        }
      } catch (error) {
        console.log(error);
      }
      // Sign up new user
      try {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) {
          commit("errorMsg", error.message);
          setTimeout(() => {
            commit("errorMsg", "");
          }, 5000);
          commit("loading", false);
          throw error;
        }
      } catch (error) {
        console.log(error);
      }
      // Add username to registered user
      try {
        const user = supabase.auth.user();
        const updates = {
          id: user.id,
          username: form.username,
        };
        let { error } = await supabase.from("users").upsert(updates);
        if (error) {
          commit("errorMsg", error);
          commit("loading", false);
          throw error;
        }
        // Sign in new user
        await dispatch("signInAction", form);
      } catch (error) {
        console.log(error);
      }
    },
    async signOutAction({ commit }) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        commit("setUser", null);
        await router.push("/login");
        commit("successMsg", "Pomyślnie wylogowano!");
        setTimeout(() => {
          commit("successMsg", "");
        }, 3000);
      } catch (error) {
        console.log(error);
      }
    },
  },
  modules: {},
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => Cookies.get(key),
        setItem: (key, value) =>
          Cookies.set(key, value, { expires: 3, secure: true }),
        removeItem: (key) => Cookies.remove(key),
      },
      paths: ["user"],
    }),
  ],
});
