<template>

  <v-navigation-drawer  style="top:70px;"  :mini-variant.sync="mini" absolute permanent
           >
          <div @mouseenter="mini = false" @mouseleave="mini=true" class="sidebar-container">
    <!-- <div
      @click="goToRoute('/collection/master_search', 0)"
      class="sidebar-option"
      :class="{'active': open == 0 || path == '/collection/master_search'}"
    >
      Master Search
      <div class="active-bar" :class="{'active': path == '/collection/master_search'}"></div>
    </div>-->
    <div
      @click.stop="goToRoute('/dashboard', 1)"
      class="sidebar-option"
      :class="{'active': open == 1 || path.indexOf('dashboard') > -1}"
    >
      <i class="fal fa-columns"></i> Dashboard
      <div class="active-bar" :class="{'active': path.indexOf('dashboard') > -1}"></div>
    </div>
          <div
            @click.stop="goToRoute('/collection/debtor?page=1', 2)"
            class="sidebar-option"
            :class="{'active' : path.indexOf('debtor') > -1}"
          ><i class="fal fa-search"></i>
            Debtor Search
            <div class="active-bar" :class="{'active': path.indexOf('debtor') > -1}"></div>
          </div>
        </div>


  </v-navigation-drawer>

</template>
<script>
export default {
  name: "sidebar",
  data() {
    return {
      open: 0,
      mini:true,
      drawer:true,
    };
  },
  mounted() {},
  methods: {
    toggleMini(){
      this.mini = true
    },
    goToRoute(route, index) {
      this.toggleOpen(index);
      this.$router.push(route);
      this.mini = true;
    },
    toggleOpen(option) {
      if (this.open == option) {
        this.open = false;
        for (let i = option; i < 100; i++) {
          if (this.$refs[i + 0.5] != null) {
            this.$refs[i + 0.5].style.transform = "translateY(0px)";
          } else {
            break;
          }
        }
        return;
      }
      this.open = option;
      setTimeout(() => {
        for (let i = 1; i < 100; i++) {
          if (this.$refs[i + 0.5] != null) {
            this.$refs[i + 0.5].style.transform = "translateY(0px)";
          } else {
            break;
          }
        }
        var height = this.$refs[option].clientHeight;
        for (let i = option; i < 100; i++) {
          if (this.$refs[i + 0.5] != null) {
            this.$refs[i + 0.5].style.transform =
              "translateY(" + height + "px)";
          } else {
            break;
          }
        }
      }, 1);
    }
  },
  computed: {
    path() {
      return this.$route.path;
    },
    admin() {
      if (this.$store.state.userStore.user.role == "admin") {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>
<style scoped>
i {
  transition: transform 0.3s ease;
}
i.active {
  transform: rotate(180deg) !important;
}
</style>
<style>
.sidebar-container {
  width:100%;
  background: #1d4562;
  height: 100%;
  min-width: 250px;
  position: absolute;
}
.active-bar {
  position: absolute;
  height: 100%;
  width: 3px;
  left: 0;
  background: transparent;
}
.active-bar.active {
  background: #ff9900;
}
.sidebar-option {
  font-size: 12pt;
  font-weight: 500;
  color: #59788f;
  display: flex;
  align-items: center;
  padding: 0px 10px;
  height: 45px;
  position: relative;
  transition: transform 0.3s ease;
  background: #1d4562;
  z-index: 10000;
  user-select: none;
  cursor: pointer;
  border-bottom: solid 1px #14364e;
  box-shadow: 0px 1px 0px rgb(255, 255, 255,.1);
  margin-bottom: 1px;
}

.sidebar-option:last-of-type {
  margin-bottom: 30px;
}
.sidebar-option:hover {
  color: #fff;
}
.sidebar-option.active {
  color: #fff;
}
.sidebar-option i {
 margin-right:0px;
 margin-left:20px;
 width:50px;
 font-size: 15pt;
}
.sidebar-sub-options {
  position: absolute;
  width: 100%;
  top: 100%;
  left: 0;
}
.sidebar-sub-options .sidebar-option {
  border: none;
  box-shadow: none;
  padding: 10px;
  padding-left: 35px;
  height: 35px;
  font-size: 10pt;
}
</style>