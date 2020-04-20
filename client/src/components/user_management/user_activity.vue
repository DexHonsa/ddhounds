<template>
  <div class="container" style="position:relative;">
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
      <div v-if="!isLoaded" class="loaderContainer animated-fast">
        <img src="@/img/double_loader.svg" alt />
      </div>
    </transition>
    <div>
      <div class="name">
        {{user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)}} {{user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1)}}
        <br />
        <span class="email">{{user.email}}</span>
        <div class="roleTag">{{user.role}}</div>
      </div>
    </div>
    <div class="historyContainer">
      <div style="margin-bottom:10px; font-size:15pt; font-weight:bold">This Weeks Activity:</div>
      <div v-if="history.length == 0" class="no-activity">No Recent Activity</div>
      <div
        @click="$router.push('/collection/clients/' + hist.client_id)"
        v-for="(hist, i) in history"
        :key="i"
        class="historyContainer"
      >
        <div v-if="hist.type == 'field'" class="historyItem">
          <div style="display:flex; align-items: center;">
            <i class="fal fa-file"></i>&nbsp;
            <span style="font-size:15pt; font-weight: bold;">{{hist.client_name}}</span>&nbsp;&nbsp;Changed&nbsp;&nbsp;
            <span
              style="font-weight: bold;"
            >{{humanize(hist.action.prop)}}</span>&nbsp;&nbsp;from&nbsp;&nbsp;
            <span style="font-weight: bold;">{{humanize(hist.action.previous_value) || `~blank~`}}</span>&nbsp;&nbsp;
            to &nbsp;&nbsp;
            <span style="font-weight: bold;">{{humanize(hist.action.new_value)}}</span>&nbsp;&nbsp; on
            &nbsp;&nbsp;
            <span style="color:#808080;">{{formatDate(hist.created_at)}}</span>
          </div>
        </div>

        <div v-if="hist.type == 'mailer'" class="historyItem">
          <div style="display:flex; align-items: center;">
            <i class="fal fa-file"></i>&nbsp;
            <span
              style="font-size:15pt; font-weight: bold; text-transform: capitalize;"
            >{{hist.client_name}}</span>&nbsp;&nbsp;
            <span style="font-weight: bold;">{{hist.message}}</span>&nbsp;&nbsp; on
            &nbsp;&nbsp;
            <span style="color:#808080;">{{formatDate(hist.created_at)}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "profile",
  data() {
    return {
      history: [],
      isLoaded: false,
      user: {}
    };
  },
  mounted() {
    this.getUser().then(() => {
      this.getHistory();
    });
  },
  methods: {
    formatDate(date2) {
      var date = new Date(date2);
      var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return monthNames[monthIndex] + " " + day + " " + year;
    },
    humanize(str) {
      if (str == "true") {
        return "Yes";
      }
      if (typeof str != "string") {
        if (typeof str == "number") {
          return str;
        }
        if (str) {
          return "Yes";
        } else {
          return "No";
        }
      }
      var frags = str.split("_");
      if (frags != null) {
        for (let i = 0; i < frags.length; i++) {
          frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        return frags.join(" ");
      } else {
        return str;
      }
    },
    getUser() {
      return new Promise(resolve => {
        axios.get("/api/users/get_user/" + this.$route.params.id).then(res => {
          resolve();
          this.user = res.data;
        });
      });
    },
    getHistory() {
      this.isLoaded = false;
      axios
        .get("/api/users/user_history/" + this.$route.params.id)
        .then(res => {
          this.history = res.data.reverse();
          var promises = [];
          for (let i = 0; i < res.data.length; i++) {
            var post = {
              _id: 1,
              first_name: 1,
              middle_name: 1,
              last_name: 1,
              type: 1
            };
            if (_.has(res.data[i], "action")) {
              post[res.data[i].action.prop] = 1;
            }

            promises.push(
              axios.post("/api/clients/fields/" + res.data[i].client_id, post)
            );
          }
          Promise.all(promises).then(results => {
            for (let i = 0; i < results.length; i++) {
              for (let k = 0; k < this.history.length; k++) {
                if (this.history[k].client_id == results[i].data._id) {
                  this.history[
                    k
                  ].client_name = `${results[i].data.first_name} ${results[i].data.last_name}`;
                }
              }
            }
            this.isLoaded = true;
            //console.log(results);
            // for(let i = 0; i < results.length;)
          });
        });
    }
  },
  computed: {}
};
</script>
<style scoped>
.loaderContainer {
  position: absolute;
  background: #fff;
  display: flex;
  align-items: center;
  top: 0;
  left: 0;
  justify-content: center;
  width: 100%;
  pointer-events: none;
  height: 100vh;
  z-index: 10000;
}
.no-activity {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  background: #eaeaea;
  margin-top: 10px;
  font-size: 15pt;
  color: #aeaeae;
}
.inner-section {
  margin-left: 80px;
  min-height: calc(100vh - 70px);
  max-width: calc(100% - 80px);
}
.container {
  padding: 55px;
}
.details {
}
.name {
  font-weight: bold;
  font-size: 20pt;
}
.email {
  color: #808080;
  font-size: 0.7em;
  font-weight: 300;
  display: block;
}
.historyContainer {
  margin-top: 0px;
}
.histItem {
  cursor: pointer;
  padding: 15px;
  background: #e3e6e7;
  border-radius: 5px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}
.histItem:hover {
  box-shadow: 1px 25px 20px -20px rgba(0, 0, 0, 0.2);
  transform: scale(1.02, 1.02);
  z-index: 100;
}
.histName {
  font-size: 15pt;
  font-weight: bold;
}
.histDate {
  font-size: 0.8em;
  color: #808080;
  font-weight: 300;
}
.histDetail {
  font-size: 12pt;
}
.roleTag {
  margin-top: 10px;
  width: min-content;
  background: #ff9900;
  color: #fff;
  height: 25px;
  padding: 0px 20px;
  border-radius: 50px;
  font-size: 10pt;
  display: inline-block;
  display: flex;
  align-items: center;
}
.historyContainer {
  display: flex;
  flex-direction: column;
}

.historyItem {
  cursor: pointer;
  background: #eaeaea;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  padding: 10px;
}
.historyItem:hover {
  background: #d8d8d8;
}
</style>