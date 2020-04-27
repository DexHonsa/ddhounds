<template>
  <div class="inner-stage">
    <div class="big-box-container">
      <div class="big-title">Welcome!</div>
      <div id="big-boxes" class="big-boxes">
        <div class="big-box">
          <i class="fal fa-users-class"></i>
          Total Debtors
          <div @click="active='first'" class="big-total">{{total}}</div>
        </div>
        <div class="big-box">
          <div style="position:relative;">
            <i class="fal fa-money-check-alt"></i>
            <i
              style="position:absolute; color:#ff9900; bottom:0; transform:translateX(25px)"
              class="fa fa-exclamation-triangle"
            ></i>
          </div>Collections in Progress
          <div @click="active='mid'" class="big-total med">{{total}}</div>
        </div>
        <div class="big-box">
          <i class="fal fa-file-invoice-dollar"></i>
          Total Collected
          <div @click="active='last'" class="big-total go">${{total_amount_collected}}</div>
        </div>
      </div>
      <div class="indicator">
        <div class="triangle" :style="triangleStyle"></div>
      </div>
    </div>
    <div>
      <div class="inner-row">
        <v-client-table
          :perPage="25"
          :data="activeItems"
          :columns="activeColumns"
          :options="options"
        >
          <div
            @click="$router.push('collection/clients/' + row._id)"
            style="display:flex; cursor:pointer; align-items:center;"
            slot="name"
            slot-scope="{row}"
          >
            <i style="color:#1d4562" class="fa fa-user-circle"></i>

            <div class="clickName" style="margin-left:10px; text-transform:capitalize">{{row.name}}</div>
          </div>
          <div slot="amount" slot-scope="{row}">${{row.amount}}</div>
          <div
            slot="created_at"
            slot-scope="{row}"
          >{{moment(new Date(row.created_at)).format('MM/DD/YYYY')}}</div>
        </v-client-table>
      </div>
    </div>
  </div>
</template>
<script>
import TableItem from "./table_item";
import moment from "moment";
import axios from "axios";
export default {
  name: "dashboard",
  data() {
    return {
      moment,
      active: "first",
      searchField: "name",
      scale: "week",
      isLoading: true,
      boxWidth: 0,
      clients: [],
      activeColumns: [],
      total: 0,
      isLoaded: false,
      transactions: [],
      activeItems: [],
      total_amount_collected: 0
    };
  },

  mounted() {
    this.boxWidth = document.getElementById("big-boxes").offsetWidth;
    window.addEventListener("resize", size => {
      let el = document.getElementById("big-boxes");
      this.boxWidth = el.offsetWidth;
    });
    this.goSearch();
    this.getTransactions();
  },
  watch: {
    active(val) {
      if (val == "last") {
        this.activeItems = this.transactions;
        this.activeColumns = ["amount", "created_at"];
      }
      if (val == "first") {
        this.activeColumns = ["name", "account_number", "creditors_total_due"];
        this.activeItems = this.clients;
      }
    }
  },
  methods: {
    getTransactions() {
      axios
        .post("/api/transactions/search", {
          term: "",
          page: "1",
          sortName: "account_number",
          sort: "asc",
          filters: [],
          creditor: this.$store.state.userStore.user.creditor
        })
        .then(res => {
          this.transactions = res.data.items;
          let total = 0;
          for (let i = 0; i < this.transactions.length; i++) {
            total += this.transactions[i].amount;
          }
          this.total_amount_collected = total;
        });
    },
    goSearch() {
      var post = {
        field: "name",
        term: "",
        page: "1",
        sortName: "first_name",
        sort: "asc",
        filters: [],
        creditor: this.$store.state.userStore.user.creditor,
        type: "all"
      };
      axios.post("/api/clients/search", post).then(res => {
        this.activeItems = res.data.items;
        this.activeColumns = ["name", "account_number", "creditors_total_due"];
        this.clients = res.data.items;
        this.total = res.data.total;
        this.isLoaded = true;
      });
    }
  },
  components: {
    TableItem
  },
  computed: {
    options() {
      return {
        perPage: 25
      };
    },
    columns() {
      return [
        { label: "Name", value: "name", type: "string" },
        { label: "Amount Due", value: "amount", type: "amount" }
      ];
    },
    columnLabels() {
      // return this.columns.map((item, i) => {
      //   return item.value;
      // });

      var columns = ["name", "account_number", "creditors_total_due"];
      return columns;
    },

    triangleStyle() {
      let width = this.boxWidth;
      let third = width / 3;
      if (this.active == "first") {
        return (
          "transform: translateY(-25px) translateX(" + (third / 2 - 50) + "px);"
        );
      }
      if (this.active == "mid") {
        return (
          "transform: translateY(-25px) translateX(" +
          (third * 2 - third / 2 - 50) +
          "px);"
        );
      }
      if (this.active == "last") {
        return (
          "transform: translateY(-25px) translateX(" +
          (third * 3 - third / 2 - 50) +
          "px);"
        );
      }
    }
  }
};
</script>
<style>
.big-title {
  position: absolute;
  top: 50px;
  left: 50px;
  font-size: 45pt;
  font-weight: 200;
}
.big-total {
  cursor: pointer;
  padding: 0px;
  border-radius: 10px;
  max-width: 250px;
  color: #000;
  width: 100%;
  display: block;
  margin-left: 50%;
  margin-top: 15px;
  transform: translateX(-50%);
  background: #fff;
  border: solid 1px #eaeaea;
  text-align: center;
  font-size: 35pt;
  transition: all 0.3s ease;
}
.big-total:hover {
  box-shadow: 1px 10px 50px rgba(0, 0, 0, 0.3);
}
.big-total.go {
  color: #0b8f67 !important;
}
.big-total.med {
  color: #ff9900;
}
.big-box {
  flex: 1;
  text-align: center;
  padding: 25px;
  font-size: 20pt;
  color: #808080;
}
.big-box i:nth-child(1) {
  display: block;
  color: #000;
  font-size: 45pt;
  margin-bottom: 10px;
}
.big-boxes {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding-top: 180px;
}
.big-box-container {
  height: 500px;
  background: #f1f2f3;
  width: calc(100% + 90px);
  margin: -45px;
  margin-bottom: 45px;
}
.cal-title {
  padding: 5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.cal-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border: solid 1px #eaeaea;
}
.cal-day {
  min-height: 300px;
  min-width: 150px;
  flex: 1;
  border-left: solid 1px #eaeaea;
  border-bottom: solid 1px #eaeaea;
}
.trans-success {
  color: #24d7a0 !important;
}
.trans-error {
  color: #ff3344 !important;
}
.date-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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
.cal-item {
  border-radius: 5px;
  padding: 5px 15px;
  color: #fff;
  margin: 5px;
  background: #24d7a0;
}
.cal-item span {
  margin-left: auto;
  font-weight: bold;
  display: inline-block;
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
  min-width: 330px;
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
.stage-container {
  display: flex;
  width: 100%;
  justify-content: center;
}
.inner-stage {
  padding: 45px;
  margin-left: -150px;
  width: 100%;
  max-width: 1500px;
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
.pending {
  background: #2648574d;
}
.indicator {
  width: 100%;
  background: #eaeaea;
  position: relative;
}
.triangle {
  height: 0px;
  width: 0px;
  border: solid 50px #fff;
  /* border-bottom-color: transparent; */
  border-top-color: transparent;
  border-right-color: transparent;
  border-left-color: transparent;
  transform: translateY(-25px);
  position: absolute;
  transition: all 0.5s ease;
}
</style>