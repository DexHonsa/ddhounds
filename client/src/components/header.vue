<template>
  <div class="header-container">
    <div class="header-logo">
      <img style="height: 40px" src="../img/q.svg" alt />
    </div>
    <!-- <div class="header-search" :class="{'active':searchActive}">
      <i class="fal fa-search"></i>
      <input
        @focus="toggleSearchActive"
        @blur="toggleSearchActive"
        type="text"
        class="header-search-input"
        placeholder="search"
      >
    </div>-->
    <div class="header-nav">
      <ul>
        <li @click="$router.push('/')" class="header-btn">
          <i class="fal fa-home"></i>
        </li>
        <li @click="$router.push('/table')" class="header-btn">
          <i class="fal fa-table"></i>
        </li>
        <li @click="$router.push('/table2')" class="header-btn">
          <i style="color: #ff9900" class="fal fa-table"></i>
        </li>
      </ul>
    </div>
    <div v-if="Object.keys(user).length > 0" class="header-nav">
      <ul>
        <li @click="$router.push('/dashboard')" class="header-btn">
          <i class="fal fa-home"></i>
        </li>
        <li
          v-show="false"
          @click="toggleDropdown('notificationsOpen')"
          class="header-btn"
          :class="{ active: notificationsOpen }"
        >
          <i class="fal fa-bell"></i>
          <div v-if="unreadNotifications.length > 0" class="not-icon">
            {{ unreadNotifications.length }}
          </div>
          <transition
            enter-active-class="fadeInLeft"
            leave-active-class="fadeOut"
          >
            <div v-if="notificationsOpen" class="basic-dropdown">
              <div class="dropdown-chev"></div>

              <div class="notification-dropdown">
                <div v-if="notifications.length == 0" class="notification-item">
                  No New Notifications
                </div>
                <div
                  class="note-item"
                  :class="[
                    { unread: !item.opened },
                    { error: item.code == 'error' },
                    { success: item.code == 'success' },
                  ]"
                  v-for="(item, index) in notifications"
                  :key="index"
                >
                  <i
                    v-if="item.code == 'error'"
                    class="fal fa-exclamation-triangle"
                  ></i>
                  <i v-if="item.code == 'success'" class="fal fa-check"></i>
                  <div v-html="item.body"></div>
                </div>
              </div>
            </div>
          </transition>
        </li>
        <li
          @click="toggleDropdown('userOpen')"
          class="header-btn"
          :class="{ active: userOpen }"
        >
          <i class="fal fa-user-circle"></i>
          <transition
            enter-active-class="fadeInLeft"
            leave-active-class="fadeOut"
          >
            <div v-if="userOpen" class="basic-dropdown">
              <div class="dropdown-chev"></div>
              <div class="user-info-container">
                <div class="user-info-image">
                  <img src="../img/mini_logo.png" style="width: 100%" alt />
                </div>
                <div class="user-info-name">Welcome!</div>
              </div>
              <span @click="$router.push('/profile')">Account</span>
              <span class="divider"></span>
              <span @click="logout">Logout</span>
            </div>
          </transition>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import auth from "@/auth.js";
import axios from "axios";
export default {
  name: "header2",
  data() {
    return {
      searchActive: false,
      settings: false,
      notificationsOpen: false,
      mailOpen: false,
      userOpen: false,
      notifications: [],
      unreadNotifications: [],
      mailers: [],
    };
  },
  mounted() {
    this.getNotifications();
    this.getDocs();
  },
  methods: {
    getDocs() {
      axios.get("/api/files/get_docs/printable").then(
        (res) => {
          this.mailers = res.data.docs;
        },
        (err) => {}
      );
    },
    downloadMailers() {
      axios.get("/api/mail/download_mailers").then((res) => {
        var link = document.createElement("a");
        link.download = "printable.zip";
        link.href = "/api/static/printable.zip";
        link.click();
      });
    },
    deleteMailers() {
      axios.get("/api/mail/delete_mailers").then((res) => {
        window.location.reload();
      });
    },
    getNotifications() {
      axios.get("/api/notifications/get_all/" + this.user.id).then((res) => {
        this.notifications = res.data;
        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].opened == false) {
            this.unreadNotifications.push(this.notifications[i]);
          }
        }
      });
    },
    logout() {
      auth.logout();
    },
    toggleSearchActive() {
      this.searchActive = !this.searchActive;
    },
    toggleDropdown(page) {
      if (page == "notificationsOpen") {
        console.log("hit");
      }
      if (!this[page]) {
        this.settings = false;
        this.userOpen = false;
        this.notificationsOpen = false;
        this.mailOpen = false;
        this[page] = !this[page];
      } else {
        this[page] = false;
      }
    },
  },
  computed: {
    user() {
      return this.$store.state.userStore.user;
    },
    admin() {
      if (this.user.role == "admin") {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
<style scoped>
::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: #1b495d;
  opacity: 0.6; /* Firefox */
}
</style>
<style>
.note-item {
  padding: 15px;
  font-size: 10pt;
  font-weight: lighter;
  display: flex;
  align-items: center;
}
.note-item i {
  margin-right: 10px;
  color: #fff;
  font-size: 12pt;
}
.note-item.unread {
}
.note-item.error {
  background: #ff000010;
  color: #fff;
}
.note-item.success {
  background: #24b47e20;
}
.not-icon {
  background: #ff0000;
  color: #fff;
  font-size: 8pt;
  font-weight: bold;
  border-radius: 100px;
  height: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 60%;
  left: 70%;
  transform: translateX(-50%) translateY(-50%);
  z-index: 10000;
}
.notification-dropdown {
  min-width: 250px;
}
.notification-item {
  padding: 15px;
  font-size: 12pt;
}
.user-info-container {
  display: flex;
  align-items: center;
  min-width: 250px;
  padding: 15px;
  border-bottom: solid 1px #eaeaea;
}
.user-info-image {
  border-radius: 100px;
  height: 35px;
  width: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22pt;
}
.user-info-name {
  font-size: 15pt;
  font-weight: bold;
  margin-left: 10px;
  color: #2a5371;
}
.header-container {
  display: flex;
  align-items: center;
  height: 70px;
  background: #2a5371;
  position: relative;
}
.header-logo {
  display: flex;
  align-items: center;
  padding: 15px;
  height: 100%;
  width: 320px;
  color: #fff;
  justify-content: left;
  font-size: 20pt;
  font-weight: bold;
}
.header-logo img {
  margin-right: 15px;
}
.header-search {
  display: flex;
  align-items: center;
  position: relative;
  min-width: 150px;
  transition: all 0.3s ease;
}
.header-search.active {
  min-width: 350px;
}
.header-search.active .header-search-input {
  background: #fff;
}
.header-search-input {
  background: #ffffff50;
  width: 100%;
  border-radius: 3px;
  border: none;
  padding: 10px;
  height: 35px;
  font-size: 12pt;
  color: #1b495d;
  font-weight: bold;
  transition: all 0.3s ease;
}

.header-search i {
  position: absolute;
  color: #1b495d;
  font-size: 10pt;
  right: 15px;
}
.header-nav {
  height: 100%;
  margin-left: auto;
  margin-right: 100px;
}
.header-nav ul {
  display: flex;
  height: 100%;
}

.header-btn {
  font-size: 16pt;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0px 27px;
  color: #fff;
  position: relative;
}
.header-btn:hover {
  background: #ffffff23;
}
.header-btn.active {
  background: #ffffff23;
}
.dropdown-chev {
  position: absolute;
  height: 0px;
  width: 0px;
  border: solid 10px #f8fafb;
  top: -20px;
  border-top-color: transparent;
  border-left-color: transparent;
  border-right-color: transparent;
  right: 0;
}
.mailItem {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
  width: 100%;
  color: #1b495d;
  border-left: solid 1px #1b495d99;
  padding: 4px;
  font-size: 10pt;

  margin: 5px;
  margin-left: 15px;
}
</style>