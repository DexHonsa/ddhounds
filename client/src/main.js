import Vue from "vue";
import App from "./App";
import router from "./router";
import VueResource from "vue-resource";
import { store } from "./store/store.js";
import VeeValidate from "vee-validate";
import VTooltip from "v-tooltip";
import VueNativeSock from 'vue-native-websocket'
import VueCroppie from "vue-croppie";
import Vuetify from 'vuetify';
// import Loader from "vue-spinner/src/RingLoader.vue";
import pusher from "vue-pusher";
import VueMq from "vue-mq";
import "./registerServiceWorker";
import {ServerTable, ClientTable, Event} from 'vue-tables-2';
import 'vuetify/dist/vuetify.min.css';
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete';

Vue.use(VuetifyGoogleAutocomplete, {
  apiKey: 'AIzaSyB0U-oQDmtHk2BpxEHhvp6Xgbspo22eKWk', // Can also be an object. E.g, for Google Maps Premium API, pass `{ client: <YOUR-CLIENT-ID> }`
});

Vue.config.productionTip = false;

require("./css/bootstrap.min.css");
require("./css/all.css");

require("./css/animate.css");
require("./css/tooltip.css");
require("./css/style.css");

require("./css/variables.scss");
require("./css/editor.scss");
require("./css/menubar.scss");
require("./css/main.scss");
require("./css/menububble.scss");
require("./css/main.css");

Vue.config.productionTip = false;
Vue.use(VueNativeSock, 'ws://localhost:3001', {
  reconnection: true, 
  reconnectionAttempts: 5, 
  reconnectionDelay: 3000,
})
Vue.use(pusher, {
  api_key: "edc0fafa92d65aa9bace",
  options: {
    cluster: "us2",
    encrypted: true
  }
});
Vue.use(Vuetify, {
  // iconfont: 'mdi',
  // icons: {},
  theme: {
    accent: '#1b366d',
    lightGreen: '#2d7cb7',
    darkBlueGradient: 'linear-gradient(90deg, #1b366d, #2d7cb7)',
    darkBlue: '#26427d',
  },
});
Vue.use(ClientTable, {options : {}, useVuex : false, theme: 'bootstrap3', template : 'default'});
Vue.use(VueResource);
Vue.use(VTooltip);
Vue.use(VeeValidate, { inject: true });
Vue.use(VueCroppie);

// Vue.component("v-loader", Loader);

Vue.use(VueMq, {
  breakpoints: {
    sm: 728,
    md: 1200,
    lg: Infinity
  }
});

Vue.directive("click-outside", {
  bind: function(el, binding, vnode) {
    el.event = function(event) {
      // here I check that click was outside the el and his childrens
      if (!(el === event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener("click", el.event);
  },
  unbind: function(el) {
    document.body.removeEventListener("click", el.event);
  }
});

// Vue.options.beforeCreate.pop();
// Vue.options.mounted.pop();

/* eslint-disable no-new */

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
