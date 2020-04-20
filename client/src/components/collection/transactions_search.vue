<template>
  <div class="inner-stage">
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
      <div v-if="!isLoaded" class="loaderContainer animated-fast">
        <div class="wrapper">
          <div class="wrapper-cell">
            <div class="image"></div>
            <div class="text">
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
            </div>
          </div>
          <div class="wrapper-cell">
            <div class="image"></div>
            <div class="text">
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
            </div>
          </div>
          <div class="wrapper-cell">
            <div class="image"></div>
            <div class="text">
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
            </div>
          </div>
          <div class="wrapper-cell">
            <div class="image"></div>
            <div class="text">
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line"></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div style="display:flex;align-items:center;">
      <v-text-field v-model="term" @keyup.enter.native="goSearch" label="Search">
        <template v-slot:prepend-inner>
          <i class="fa fa-search"></i>
        </template>
      </v-text-field>
      <v-menu
        v-model="filterMenu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
        offset-y
      >
        <template v-slot:activator="{ on }">
          <v-btn color="indigo" dark v-on="on">
            <i class="fal fa-filter"></i>
          </v-btn>
        </template>

        <v-card style="width:400px">
          <div style="padding:15px;">
            <v-select
              v-model="filter"
              item-text="label"
              item-value="value"
              @change="getDataType"
              :items="columns"
              label="Column"
            ></v-select>
            <div style="display:flex;" v-if="activeDataType == 'number'">
              <v-select
                v-model="filterOperator"
                label="Operator"
                :items="['between', 'greater than','less than']"
              ></v-select>
              <v-text-field
                v-if="filterOperator == 'between'"
                style="margin-left:10px;"
                label="min"
                v-model="filterMin"
              ></v-text-field>
              <v-text-field
                v-if="filterOperator == 'between'"
                style="margin-left:10px;"
                label="max"
                v-model="filterMax"
              ></v-text-field>
              <v-text-field
                v-if="filterOperator != 'between'"
                style="margin-left:10px;"
                label="value"
                v-model="filterValue"
              ></v-text-field>
            </div>
            <div style="display:flex;" v-if="activeDataType == 'string'">
              <v-select v-model="filterOperator" label="Operator" :items="['contains', 'excludes']"></v-select>
              <v-text-field style="margin-left:10px;" label="Value" v-model="filterValue"></v-text-field>
            </div>
            <div style="display:flex;" v-if="activeDataType == 'bool'">
              <v-select v-model="filterOperator" label="Operator" :items="['equals']"></v-select>
              <v-select v-model="filterValue" label="Value" :items="['true','false']"></v-select>
            </div>
            <div style="display:flex;" v-if="activeDataType == 'date'">
              <v-select v-model="filterOperator" label="Operator" :items="['before', 'after']"></v-select>
              <v-menu
                v-model="pickerOpen"
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
                    v-model="filterStartDate"
                    label="Payment Start Date"
                    style="max-width:200px;"
                    prepend-icon="event"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="filterStartDate" light @input="pickerOpen = false"></v-date-picker>
              </v-menu>
            </div>
            <div style="display:flex; align-items:center;">
              <v-select
                v-model="filterSort"
                label="Sorting"
                style="max-width:100px"
                :items="['asc','dec']"
              ></v-select>
            </div>
            <div style="color:#ff0000; font-size:10pt;" v-if="filterError">{{filterErrorMessage}}</div>
          </div>

          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn flat @click="filterMenu = false">Cancel</v-btn>
            <v-btn color="primary" flat @click="submitFilter">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
    <div style="display:flex; align-items:center">Total Records: {{total}}</div>
    <v-client-table
      v-if="isLoaded"
      :perPage="25"
      :data="clients"
      :columns="columnLabels"
      :options="options"
    >
      <div
        slot="amount"
        style="max-width:100px;"
        slot-scope="{row}"
      >${{Number(row.amount).toFixed(2)}}</div>
      <div slot="phone" slot-scope="{row}">{{formatPhone(row.phone)}}</div>
      <div slot="user_name" slot-scope="{row}">
        <span style="text-transform:capitalize">{{row.user_name}}</span>
      </div>

      <div
        slot="monthly_payment_amount"
        style="text-transform:capitalize"
        slot-scope="{row}"
      >{{row.monthly_payment_amount}}</div>

      <div style="display:flex; align-items:center;" slot="payment_date" slot-scope="{row}">
        <div>{{formatDate(row.payment_date)}}</div>
      </div>
      <div style="display:flex; align-items:center;" slot="created_at" slot-scope="{row}">
        <div>{{formatDate(row.created_at)}}</div>
      </div>
    </v-client-table>
    <div style="display:flex; align-items:center;">
      <div v-if="page > 1" @click="previousPage" class="next-page">Previous Page</div>
      <div>Page: {{page}}</div>
      <div @click="nextPage" class="next-page">Next Page</div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "collection",
  data() {
    return {
      clients: [],
      total: 0,
      isLoaded: false,
      pickerOpen: false,
      term: "",
      filterMenu: false,
      activeDataType: "number",
      filterMin: 0,
      filterMax: 0,
      filterValue: "",
      filterStartDate: "",
      filterEndDate: "",
      filterOperator: "between",
      filter: "",
      filterSort: "asc",
      filterError: false,
      filterErrorMessage: ""
    };
  },
  mounted() {
    this.getClients();
    if (this.page == null) {
      this.$router.push({ query: { page: 1 } });
    }
  },

  methods: {
    submitFilter() {
      this.$router.push({ query: { page: 1 } });
      if (this.activeDataType == "number") {
        if (this.filterOperator == "between") {
          if (this.filterMin == 0 || this.filterMax == 0) {
            this.filterError = true;
            this.filterErrorMessage = "Please Fix the issues";
            return;
          }
        } else {
          if (this.filterValue == "" || this.filterOperator == "") {
            this.filterError = true;
            this.filterErrorMessage = "Please Fix the issues";
            return;
          }
        }
      }
      if (this.activeDataType == "string") {
        if (this.filterValue == "" || this.filterOperator == "") {
          this.filterError = true;
          this.filterErrorMessage = "Please Fix the issues";
          return;
        }
      }
      if (this.activeDataType == "date") {
        if (this.filterStartDate == "" || this.filterOperator == "") {
          this.filterError = true;
          this.filterMessage = "Please Fix the issues";
          return;
        }
      }
      var post = {
        term: this.term,
        filters: [
          {
            name: this.filter,
            type: this.activeDataType,
            min: this.filterMin,
            max: this.filterMax,
            value: this.filterValue,
            startDate: this.filterStartDate,
            operator: this.filterOperator
          }
        ],
        sort: this.filterSort,
        sortName: this.filter,
        type: "master",
        page: this.page,
        creditor: this.$store.state.userStore.user.creditor
      };
      axios.post("/api/transactions/search", post).then(res => {
        this.clients = res.data.items;
        this.total = res.data.total;
        this.isLoaded = true;
      });
    },
    getDataType(filter, i) {
      var arr = this.columns.filter((item, i) => {
        return item.value == filter;
      });
      if (arr[0].type == "string") {
        this.filterOperator = "contains";
      }
      if (arr[0].type == "number") {
        this.filterOperator = "between";
      }
      if (arr[0].type == "date") {
        this.filterOperator = "before";
      }
      if (arr[0].type == "bool") {
        this.filterOperator = "equals";
      }
      this.activeDataType = arr[0].type;
    },
    nextPage() {
      this.isLoaded = false;
      this.$router.push({
        query: {
          page: Number(this.page) + 1
        }
      });
      this.goSearch();
    },
    previousPage() {
      this.isLoaded = false;
      this.$router.push({ query: { page: Number(this.page) - 1 } });
      this.goSearch();
    },
    goSearch() {
      this.isLoaded = false;
      axios
        .post("/api/transactions/search", {
          creditor: this.$store.state.userStore.user.creditor,
          term: this.term,
          page: this.page,
          sortName: "account_number",
          sort: "asc",
          filters: this.filters,
          type: "master"
        })
        .then(res => {
          this.clients = res.data.items;
          this.total = res.data.total;
          this.isLoaded = true;
        });
    },
    formatPhone(phoneNumberString) {
      var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
      var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return "(" + match[1] + ") " + match[2] + "-" + match[3];
      }
      return null;
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
    getClients() {
      axios
        .post("/api/transactions/search", {
          term: "",
          page: this.page,
          sortName: "account_number",
          sort: "asc",
          filters: this.filters,
          creditor: this.$store.state.userStore.user.creditor
        })
        .then(res => {
          this.clients = res.data.items;
          this.total = res.data.total;
          this.isLoaded = true;
        });
    }
  },
  computed: {
    page() {
      return this.$route.query.page;
    },
    filters() {
      if (this.filter != "") {
        return [
          {
            name: this.filter,
            type: this.activeDataType,
            min: this.filterMin,
            max: this.filterMax,
            value: this.filterValue,
            startDate: this.filterStartDate,
            operator: this.filterOperator
          }
        ];
      } else {
        return [];
      }
    },
    columns() {
      return [
        { label: "Account Number", value: "account_number", type: "string" },
        { label: "Agent Name", value: "user_name", type: "string" },
        {
          label: "Transaction Amount",
          value: "amount",
          type: "number"
        },
        { label: "Payment Date", value: "payment_date", type: "date" },
        {
          label: "Created On",
          value: "created_at",
          type: "date"
        },
        {
          label: "Transaction ID",
          value: "transaction_id",
          type: "string"
        },
        {
          label: "Type",
          value: "type",
          type: "string"
        }
      ];
    },
    columnLabels() {
      // return this.columns.map((item, i) => {
      //   return item.value;
      // });

      var columns = [
        "account_number",
        "user_name",
        "amount",
        "payment_date",
        "created_at",
        "transaction_id",
        "type"
      ];
      if (this.filter != "") {
        columns.push(this.filter.toLowerCase().replace(" ", "_"));
      }
      return columns;
    },
    options() {
      return {
        perPage: 25
      };
    }
  }
};
</script>
<style>
.clickName {
  color: #5050d1;
}
.clickName:hover {
  color: #3b3bb6;
  text-decoration: underline;
}
.wrapper {
  margin: 30px;
  padding: 50px 20px;
  margin-bottom: 0;
  background: #fff;
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wrapper-cell {
  width: 100%;
  display: flex;
  margin-bottom: 30px;
  padding: 15px;
}

@-webkit-keyframes placeHolderShimmer {
  0% {
    background-position: -768px 0;
  }
  100% {
    background-position: 768px 0;
  }
}

@keyframes placeHolderShimmer {
  0% {
    background-position: -768px 0;
  }
  100% {
    background-position: 768px 0;
  }
}
.animated-background,
.image,
.text-line {
  -webkit-animation-duration: 2.25s;
  animation-duration: 2.25s;
  -webkit-animation-fill-mode: forwards;
  animation-fill-mode: forwards;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-name: placeHolderShimmer;
  animation-name: placeHolderShimmer;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  background: #f6f6f6;
  background: linear-gradient(to right, #f6f6f6 8%, #f0f0f0 18%, #f6f6f6 33%);
  background-size: 800px 104px;
  height: 96px;
  position: relative;
}

.image {
  min-height: 160px !important;
  min-width: 160px !important;
}

.text {
  margin-left: 20px;
  position: relative;
  width: 100%;
}

.text-line {
  height: 25px;
  width: 100%;
  margin-bottom: 20px;
}
</style>