import Vue from "vue";
import Vuex from "vuex";

import userStore from './user';

// import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export const store = new Vuex.Store({
  modules: {
   userStore,
  },
  // plugins: [createPersistedState()],
  state: {
  },
  getters: {},
  mutations: {
    
  },
  actions: {
    
    
  }
});
