<template>
  <v-app id="app">
    <router-view name="header"></router-view>
    <router-view name="sidebar"></router-view>
    <router-view name="login"></router-view>
    <router-view class="inner-section" name="inner">
      <router-view name="footer"></router-view>
    </router-view>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
import jwtDecode from "jwt-decode";

export default {
  name: "App",

  methods: {
    ...mapActions(["setToken", "setUser"])
  },
  created() {
    // const token = localStorage.getItem("token");
    // if (token) {
    //   this.setToken(token);
    // } else {
    //   if (this.$route.path.indexOf("reset") > -1) {
    //   } else {
    //     this.$router.push("/");
    //   }
    // }
  },
  mounted() {
    // const token = localStorage.getItem("token");
    // if (token) {
    //   //
    // } else {
    //   if (
    //     this.$route.path.indexOf("reset") > -1 ||
    //     this.$route.path.indexOf("new") > -1
    //   ) {
    //   } else {
    //     this.$router.push("/");
    //   }
    // }
  },
  computed: {
    path() {
      return this.$route.path;
    }
  }
};
</script>
<style>
#app {
  position: relative;
  font-family: "Montserrat";
  overflow: hidden;
  background: #fff;
}
.inner-section {
  margin-left: 80px;
  min-height: calc(100vh - 70px);
}
</style>
