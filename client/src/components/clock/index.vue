<template>
  <div class="inner-stage">
    <div>
      <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
        <div v-if="isLoading" class="loaderContainer animated-fast">
          <img src="@/img/double_loader.svg" alt />
        </div>
      </transition>
      <div v-if="!isLoading" class="inner-row">
        <div style="padding:15px 0px;">
          <div style="font-weight:bold; font-size:16pt;">{{moment().format('dddd')}}</div>
          <div style="font-size:12pt; color:#808080">{{moment().format('MMM DD')}}</div>
        </div>
        <div>
          <div class="clock-times">
            <div class="clock-time-item">
              <div class="clock-time-label">Clock In:</div>
              <div class="clock-time-value">{{clock_in ? moment(clock_in).format('h:mm A') :'--'}}</div>
            </div>
            <div class="clock-time-item">
              <div class="clock-time-label">Lunch Start:</div>
              <div class="clock-time-value">{{lunch_in ? moment(lunch_in).format('h:mm A') :'--'}}</div>
            </div>
            <div class="clock-time-item">
              <div class="clock-time-label">Lunch End:</div>
              <div class="clock-time-value">{{lunch_out ? moment(lunch_out).format('h:mm A') :'--'}}</div>
            </div>
            <div class="clock-time-item">
              <div class="clock-time-label">Clock Out:</div>
              <div class="clock-time-value">{{clock_out ? moment(clock_out).format('h:mm A') :'--'}}</div>
            </div>
          </div>
          <div class="clock-in-btn">
            <v-btn
              v-if="!clock_in"
              @click="clock('in')"
              :loading="clockLoading"
              style="margin:0;"
              class="white--text"
              :color="$vuetify.theme.lightGreen"
              depressed
            >
              <i class="fal fa-clock"></i>
              <span style="display:block; margin-left:10px;">Clock In</span>
            </v-btn>
            <v-btn
              v-if="!lunch_in && clock_in"
              :loading="clockLoading"
              @click="clock('lunch_in')"
              style="margin:0;"
              class="white--text"
              :color="$vuetify.theme.lightGreen"
              depressed
            >
              <i class="fal fa-utensil-fork"></i>
              <span style="display:block; margin-left:10px;">Start Lunch</span>
            </v-btn>
            <v-btn
              v-if="!lunch_out && lunch_in"
              :loading="clockLoading"
              @click="clock('lunch_out')"
              style="margin:0;"
              class="white--text"
              :color="'#ff8888'"
              depressed
            >
              <i class="fal fa-utensil-fork"></i>
              <span style="display:block; margin-left:10px;">End Lunch</span>
            </v-btn>
            <v-btn
              v-if="!clock_out && lunch_out"
              :loading="clockLoading"
              @click="clock('out')"
              style="margin:0;"
              class="white--text"
              :color="$vuetify.theme.lightGreen"
              depressed
            >
              <i class="fal fa-clock"></i>
              <span style="display:block; margin-left:10px;">Clock Out</span>
            </v-btn>
            <div style="color:#33aa99; font-size:16pt;" v-if="clock_out"><i style="color:#33aa99" class="fal fa-thumbs-up"></i> Done!</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import axios from "axios";
import moment from "moment";
export default {
  name: "dashboard",
  data() {
    return {
      moment,
      isLoading: true,
      clock_in: null,
      clock_out: null,
      lunch_in: null,
      lunch_out: null,
      clockLoading:false
    };
  },

  mounted() {
    this.getClock().then(() => {
      this.isLoading = false;
    });
  },
  methods: {
    clock(time) {
      this.clockLoading = true;
      let d = new Date();
      d.setHours(0, 0, 0, 0);
      let post = {
        date: d,
        user_id: this.$store.state.userStore.user.id,
      };

      if(time == 'in'){
        post.clock_in = new Date()
      }
      if(time == 'out'){
        post.clock_out = new Date()
      }
      if(time == 'lunch_in'){
        post.lunch_in = new Date()
      }
      if(time == 'lunch_out'){
        post.lunch_out = new Date()
      }

      
      
      axios.post("/api/timesheet/clock", post).then(
        res => {
          
          this.getClock().then(()=>{
            this.clockLoading = false;
          });
        },
        err => {
          this.clockLoading = false;
          console.log("nah");
        }
      );
    },
    getClock() {
      return new Promise((resolve, reject) => {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        let post = {
          date: today,
          user_id: this.$store.state.userStore.user.id
        };

        axios.post("/api/timesheet/get_clock", post).then(
          res => {
            console.log(res.data);
            this.clock_in = res.data.clock_in;
            this.clock_out = res.data.clock_out;
            this.lunch_in = res.data.lunch_in;
            this.lunch_out = res.data.lunch_out;
            resolve();
          },
          err => {
            resolve();
          }
        );
      });
    }
  },
  components: {},
  computed: {}
};
</script>
<style>
.clock-in-btn {
  margin-top: 15px;
}
.clock-times {
  padding: 15px;
  background: #e3e6e7;
  max-width: 500px;
}
.clock-time-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.clock-time-label {
  font-size: 10pt;
  font-weight: normal;
  color: #1b495d;
}
.clock-time-value {
  font-size: 10pt;
  margin-left: auto;
}
</style>
<style>
.form-control {
  border-radius: 0px !important;
}
.form-control:focus {
  border-color: #24d7a0 !important;
}
.VueTables__search-field {
  display: flex;
}
.VueTables__search-field label {
  margin-right: 10px;
}
.table-striped tbody tr:nth-of-type(odd) {
  background-color: #ffffff !important;
}
.table-hover tbody tr:hover {
  background-color: #f8fafb !important;
}
.VueTables__search {
  display: none !important;
}
.table thead th {
  background: #e8eaec;
}
.OnTime {
  background: #24d7a0;
}
.Overdue {
  background: #ff3344;
}
.status-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px;
  font-size: 10pt;
  height: 30px;
  color: #fff;
  border-radius: 3px;
}
.page-item.active .page-link {
  background-color: #e8eaec !important;
  border-color: #e8eaec !important;
}
.page-link {
  color: #868e96 !important;
}
.page-item.active .page-link {
  color: #1b495d !important;
}
.text-center {
  display: flex;
  align-items: center;
}
.VuePagination__count {
  margin: 0;
}
.VueTables__limit-field {
  display: none !important;
}
.pending {
  background: #2648574d;
}
</style>