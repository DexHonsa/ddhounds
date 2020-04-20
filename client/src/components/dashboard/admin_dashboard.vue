<template>
  <div class="inner-stage">
    <div>
      <div class="inner-row">
        <div class="box">
          <div class="basic-title">
            Account Activity
            <div class="date-container">
              <v-btn @click="changeDateScale('week')">This Week</v-btn>
              <v-btn @click="changeDateScale('month')">This Month</v-btn>
              <v-btn @click="changeDateScale('ytd')">YTD</v-btn>
              <v-menu
                :color="$vuetify.theme.lightGreen"
                v-model="startpickerOpen"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :color="$vuetify.theme.lightGreen"
                    v-model="startDate"
                    label="Start Date"
                    style="max-width:200px;"
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :color="$vuetify.theme.lightGreen"
                  v-model="startDate"
                  light
                  @input="startpickerOpen = false"
                ></v-date-picker>
              </v-menu>
              <v-menu
                :color="$vuetify.theme.lightGreen"
                v-model="endpickerOpen"
                :close-on-content-click="false"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :color="$vuetify.theme.lightGreen"
                    v-model="endDate"
                    label="End Date"
                    style="max-width:200px;"
                    prepend-icon="event"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :color="$vuetify.theme.lightGreen"
                  v-model="endDate"
                  light
                  @input="endpickerOpen = false"
                ></v-date-picker>
              </v-menu>
            </div>
          </div>
          <div class="box-content">
            <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
              <div v-if="isLoading" class="loaderContainer animated-fast">
                <img src="@/img/double_loader.svg" alt />
              </div>
            </transition>
            <div
              @click="expand = !expand"
              v-if="!isLoading"
              v-for="(agent, index) in users"
              :key="index"
              class="agent-box"
            >
              <div class="agent-box-inner">
                <div class="agent-name">{{agent.first_name}} {{agent.last_name}}</div>
                <div
                  class="agent-transaction-number"
                >Transactions: {{agent.transactions.length || 0}}</div>
                <div class="agent-amount">
                  <div>
                    ${{getApprovedAmount(agent.transactions)}}
                    <div
                      style="font-size:9pt; font-weight:normal; display:block; white-space:nowrap"
                    >pending (${{getPendingAmount(agent.transactions)}})</div>
                  </div>
                </div>
              </div>

              <v-expand-transition>
                <div class="expand-panel" v-if="expand">
                  <div class="expand-panel-inner">
                    <div
                      @click="$router.push('/collection/clients/' + item.client_id)"
                      v-for="(item, index) in agent.transactions"
                      :key="index"
                      class="transaction-item"
                    >
                      {{formatDate(item.created_at)}} ({{formatDate(item.payment_date)}})
                      <span
                        :class="[{'trans-error' : item.transaction_id == 'Error' }, {'trans-success' : item.transaction_id != 'Error' && item.transaction_id != 'none' }]"
                      >${{Number(item.amount).toFixed(2)}}</span>
                    </div>
                  </div>
                  <div
                    class="commision"
                  >Total Commision Earned: ${{calculateCommission(getApprovedAmount(agent.transactions))}}</div>
                </div>
              </v-expand-transition>
            </div>
          </div>
        </div>
      </div>
      <div class="inner-row">
        <div class="cal-container">
          <div v-for="(item,i) in days" :key="i" class="cal-day">
            <div class="cal-title">Sunday <span>25</span></div>
          </div>
          
        </div>
      </div>
      <!-- <div class="inner-row">
        <div class="box">
          <div class="basic-title">New Signed Clients</div>
          <div class="box-content">
            <v-client-table :data="tableData" :columns="columns" :options="options">
              <div style="display:flex; align-items:center;" slot="name" slot-scope="{row}">
                <div
                  style="display:flex; background:#24d7a0; align-items:center; justify-content:center; height:25px; width:25px; border-radius:300px"
                >
                  <i style="color:#fff" class="fa fa-user-circle"></i>
                </div>
                <div style="margin-left:10px;">{{row.name}}</div>
              </div>

              <div style="display:flex; align-items:center;" slot="status" slot-scope="{row}">
                <div :class="[row.status.replace(' ', ''), 'status-tag']">{{row.status}}</div>
              </div>
            </v-client-table>
          </div>
        </div>
      </div>-->
    </div>
  </div>
</template>
<script>
import TableItem from "./table_item";
import axios from "axios";
export default {
  name: "dashboard",
  data() {
    return {
      isLoading: true,
      expand: false,
      users: [],
      transactionHistory: [],
      startpickerOpen: false,
      endpickerOpen: false,
      startDate: "2019-09-24",
      endDate: "2019-10-24",
      days:[]
    };
  },
  mounted() {
    let today = new Date();
    let startDay = today.setDate(-7);
    console.log(startDay);
    this.changeDateScale("month");
  },
  methods: {
    calculateCommission(amount) {
      if (amount < 2000) {
        return Number(amount * 0).toFixed(2);
      }
      if (amount >= 2000 && amount < 4000) {
        return Number(amount * 0.03).toFixed(2);
      }
      if (amount >= 4000 && amount < 6000) {
        return Number(amount * 0.05).toFixed(2);
      }
      if (amount >= 6000 && amount < 8000) {
        return Number(amount * 0.07).toFixed(2);
      }
      if (amount >= 7500) {
        return Number(amount * 0.1).toFixed(2);
      }
    },
    formatDateString(date) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },
    startOfWeek(date) {
      var diff =
        date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

      return new Date(date.setDate(diff));
    },
    endOfWeek(date) {
      var lastday = date.getDate() - (date.getDay() - 1) + 6;
      return new Date(date.setDate(lastday));
    },
    changeDateScale(scale) {
      this.users = [];
      this.transactionHistory = [];
      this.isLoading = true;
      if (scale == "week") {
        let today = new Date();
        let t = new Date();
        let startDay = this.startOfWeek(today);
        let endDay = this.endOfWeek(today);
        this.startDate = this.formatDateString(new Date(startDay));
        this.endDate = this.formatDateString(new Date(endDay));
      }
      if (scale == "month") {
        let today = new Date();
        let t = new Date();
        var startDay = new Date(today.getFullYear(), today.getMonth(), 1);
        var endDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.startDate = this.formatDateString(new Date(startDay));
        this.endDate = this.formatDateString(new Date(endDay));
      }
      // if (scale == "year") {
      //   let today = new Date();
      //   let t = new Date();
      //   let startDay = t.setDate(today.getDate() - 365);
      //   let endDay = today.setDate(today.getDate() + 1);
      //   this.startDate = this.formatDateString(new Date(startDay));
      //   this.endDate = this.formatDateString(new Date(endDay));
      // }
      if (scale == "ytd") {
        let today = new Date();
        let t = new Date();

        let endDay = today.setDate(today.getDate() + 1);
        let e = new Date("2019-01-01");
        e.setYear(today.getFullYear() - 1);
        const diffTime = Math.abs(today - e);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let startDay = t.setDate(today.getDate() - diffDays + 2);
        this.startDate = this.formatDateString(new Date(startDay));
        this.endDate = this.formatDateString(new Date(endDay));
      }
      this.getUsers();
    },
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
    getApprovedAmount(transactions) {
      if (transactions != null) {
        let amount = 0;
        for (let i = 0; i < transactions.length; i++) {
          if (
            transactions[i].transaction_id != "Error" &&
            transactions[i].transaction_id != "none"
          ) {
            amount = amount + Number(transactions[i].amount);
          }
        }
        return Number(amount).toFixed(2);
      } else {
        return 0;
      }
    },
    getPendingAmount(transactions) {
      if (transactions != null) {
        let amount = 0;
        for (let i = 0; i < transactions.length; i++) {
          if (transactions[i].transaction_id == "none") {
            amount = amount + Number(transactions[i].amount);
          }
        }
        return Number(amount).toFixed(2);
      } else {
        return 0;
      }
    },
    getErrorAmount(transactions) {
      if (transactions != null) {
        let amount = 0;
        for (let i = 0; i < transactions.length; i++) {
          if (transactions[i].transaction_id == "Error") {
            amount = amount + Number(transactions[i].amount);
          }
        }
        return Number(amount).toFixed(2);
      } else {
        return 0;
      }
    },
    getUsers() {
      this.isLoading = true;
      axios.get("/api/users/get_users/").then(res => {
        this.users = res.data;
        for (let p = 0; p < this.users.length; p++) {
          this.users[p].transactions = [];
        }
        let promises = [];
        for (let i = 0; i < this.users.length; i++) {
          promises.push(
            axios.post("/api/dashboard/get_transaction_history", {
              userId: this.users[i]._id,
              startDate: this.startDate,
              endDate: this.endDate
            })
          );
        }

        Promise.all(promises).then(results => {
          for (let i = 0; i < results.length; i++) {
            let transactions = results[i].data;

            for (let k = 0; k < this.users.length; k++) {
              if (transactions.length > 0) {
                if (results[i].data[0] != null) {
                  if (this.users[k]._id == results[i].data[0].user_id) {
                    this.users[k].transactions = transactions;
                  }
                }
              }
            }
          }
          this.isLoading = false;
        });
      });
    }
    // generateChart() {
    //   Chart.defaults.global.defaultFontColor = "#606060";
    //   Chart.defaults.global.tooltips.caretSize = 0;
    //   Chart.defaults.global.tooltips.mode = "x-axis";
    //   Chart.defaults.global.tooltips.titleFontFamily = "Quicksand";
    //   Chart.defaults.global.tooltips.bodyFontFamily = "Quicksand";

    //   //LINE CHART
    //   var ctx2 = document.getElementById("chart");
    //   var myChart2 = new Chart(ctx2, {
    //     type: "bar",
    //     data: {
    //       labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
    //       datasets: [
    //         {
    //           label: "New Accounts",
    //           data: [0, 0, 1, 4, 10, 12, 16],
    //           borderColor: "#1b495d",
    //           pointBackgroundColor: "#1b495d",
    //           pointRadius: 3,
    //           pointHoverRadius: 5,
    //           backgroundColor: "#24d7a0"
    //         }
    //       ]
    //     },
    //     options: {
    //       tooltips: {
    //         caretSize: 0
    //       },
    //       legend: {
    //         display: false,
    //         position: "bottom",
    //         labels: {
    //           boxWidth: 2,
    //           fontFamily: "Quicksand",
    //           fontSize: 10
    //         }
    //       },
    //       scales: {
    //         yAxes: [
    //           {
    //             ticks: {
    //               beginAtZero: true,
    //               callback: function(value, index, values) {
    //                 if (parseInt(value) > 1000) {
    //                   return (
    //                     "$" +
    //                     value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    //                   );
    //                 } else {
    //                   return value;
    //                 }
    //               },

    //               fontSize: 10,
    //               fontFamily: "Quicksand"
    //             },
    //             gridLines: {
    //               color: "rgba(0, 0, 0, .1)",
    //               zeroLineColor: "rgba(255,255,255,0.1)"
    //             }
    //           }
    //         ],
    //         xAxes: [
    //           {
    //             ticks: {
    //               fontSize: 10,
    //               fontFamily: "Quicksand"
    //             },
    //             gridLines: {
    //               color: "rgba(0, 0, 0, 0)",
    //               zeroLineColor: "rgba(255,255,255,0.0)"
    //             },
    //             categorySpacing: 10,
    //             barPercentage: 0.7
    //           }
    //         ]
    //       },
    //       responsive: true,
    //       maintainAspectRatio: false
    //     }
    //   });
    // }
  },
  components: {
    TableItem
  },
  computed: {}
};
</script>
<style>
.trans-success {
  color: #24d7a0 !important;
}
.trans-error {
  color: #ff3344 !important;
}
.date-container {
  display: flex;
  align-items: flex-start;
  margin-left: 15px;
}
.commision {
  position: relative;
  bottom: 0;
  margin-top: 100px;
  width: 100%;
  background: #0b8f67;
  color: #fff;
  font-size: 12pt;
  display: flex;
  align-items: center;
  padding-left: 15px;
  height: 50px;
  left: 0;
}
.transaction-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-bottom: solid 1px #00000020;
}
.transaction-item:hover {
  background: #e4f4fd;
}
.transaction-item span {
  margin-left: auto;
  font-weight: bold;
  color: #1b495d;
}
.expand-panel {
  width: 100%;
  background: #fff;

  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}
.expand-panel-inner {
  height: 200px;
  overflow: auto;
}
.agent-box {
  background: #f8fafb;
  border: solid 1px rgb(202, 202, 202);
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 15px;
  position: relative;
  flex: 1;
  box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.2);
  flex-basis: 25%;
  transition: all 0.3s ease;
}
.agent-box:hover {
  background: #e4f4fd;
}
.agent-box-inner {
  padding: 15px;
  position: relative;
}
.agent-amount {
  margin-left: auto;
  background: #1b495d;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  color: #fff;
  border-bottom-left-radius: 100px;
  border-top-left-radius: 100px;
  font-size: 15pt;
  justify-content: flex-end;
  font-weight: bold;
  padding: 0px 10px;
  width: 150px;
  justify-content: center;
}
.agent-name {
  font-size: 15pt;
  font-weight: bold;
}
.agent .inner-row {
  width: 100%;
  margin-bottom: 25px;
}
.inner-stage {
  padding: 45px;
  width: calc(100% - 80px);
  position: relative;
  background-color: #fff;
  color: #444;
}
.chart-container {
  height: 300px;
}
.box {
  border: solid 1px #e8eaec;
}
.box-content {
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
}
.basic-title {
  display: flex;
  align-items: center;
  padding: 15px;

  background: #e8eaec;
  font-size: 12pt;
  font-weight: bold;
  color: #1b495d;
  margin-bottom: 10px;
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
</style>