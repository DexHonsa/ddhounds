import axios from "axios";
import jwt_decode from "jwt-decode";

var initialState = {
  projects: []
};

export default {
  state: {
    user: {}
  },
  mutations: {
    SET_USER(state, payload) {
        var user = payload;
        state.user = user;
      }
  },
  getters: {},
  actions: {
   setUser({ commit }, payload) {
      commit("SET_USER", payload);
    },
    setToken(context, payload) {
      var decoded = jwt_decode(payload);
      context.commit("SET_USER", decoded);
    }
  }
};
