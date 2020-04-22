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
      <v-text-field
        v-model="term"
        @keyup.enter.native="$router.push({ query: { page: 1 } }), goSearch()"
        label="Search"
      >
        <template v-slot:prepend-inner>
          <i class="fa fa-search"></i>
        </template>
      </v-text-field>
      <div class="searchBarDropdown">
        <v-menu v-model="menu" offset-y :nudge-top="0" :nudge-left="0">
          <template v-slot:activator="{on}">
            <div class="activator" @click="menu = true" v-on:on="{on}">{{selector}}</div>
          </template>
          <v-card width="150">
            <div @click="selector = 'corporate'" class="list">Corporate</div>
            <div @click="selector = 'personal'" class="list">Personal</div>
          </v-card>
        </v-menu>
      </div>
      <!-- <v-menu
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
              <div v-if="activeFilter.options">
                <v-select label="select one" value="Select One" :items="activeFilter.options"></v-select>
              </div>
              <div v-else>
                <v-select
                  v-model="filterOperator"
                  label="Operator"
                  :items="['contains', 'excludes']"
                ></v-select>
                <v-text-field style="margin-left:10px;" label="Value" v-model="filterValue"></v-text-field>
              </div>
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
      </v-menu>-->
    </div>
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOutDown">
      <div
        v-if="isLoading"
        class="animated-med"
        style="position:absolute;display: flex; flex-direction: column; justify-content:center; align-items: center; width:100%; height:80%;"
      >
        <lottie
          :options="defaultOptions"
          :height="200"
          :width="500"
          v-on:animCreated="handleAnimation"
        />
        <br />
        <div
          style="color:#ffffff30; font-size: 10pt; text-transform: uppercase; letter-spacing: 2px;"
        >Loading...</div>
      </div>
    </transition>
    <div v-if="!isLoading">
      <div style="display:flex; align-items:center">Total Records: {{total}}</div>
      <v-client-table
        v-if="isLoaded"
        :data="names"
        :columns="['titles','name','heading_type']"
        :options="options"
        @sorted="sortMe"
      >
        <template slot="h__titles">Titles</template>
        <div slot="titles" style="max-width:50px;" slot-scope="{row}">{{row.titles}}</div>
        <div slot="name" style="max-width:100px; max-height:25px;" slot-scope="{row}">
          <a style="white-space:nowrap" :href="row.link">{{row.name}}</a>
        </div>
        <div slot="heading_type" slot-scope="{row}">{{row.heading_type}}</div>

        <div
          slot="monthly_payment_amount"
          style="text-transform:capitalize"
          slot-scope="{row}"
        >{{row.monthly_payment_amount}}</div>
      </v-client-table>
      <div style="display:flex; align-items:center;">
        <div v-if="page > 1" @click="previousPage" class="next-page">Previous Page</div>
        <div>Page: {{page}}</div>
        <div @click="nextPage" class="next-page">Next Page</div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import Lottie from "vue-lottie";
import animationData from "../login/data.json";
export default {
  name: "collection",
  data() {
    return {
      moment,
      names: [],
      total: 0,
      isLoading: false,
      isLoaded: true,
      pickerOpen: false,
      activeFilterOption: "",
      term: this.$route.query.term || "**",
      lastTerm: "",
      filterMenu: false,
      menu: false,
      selector: this.$route.query.selector || "corporate",
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
      filterErrorMessage: "",
      searchField: "name",
      columnSort: "first_name",
      activeFilter: null,
      defaultOptions: { animationData, loop: true },
      animationSpeed: 1
    };
  },
  mounted() {
    this.getNames();
    if (this.page == null) {
      this.$router.push({ query: { page: 1 } });
    }
  },

  methods: {
    handleAnimation: function(anim) {
      this.anim = anim;
    },
    getNames() {
      this.isLoading = true;
      let term = this.term.replace(/\*/gi, "%");
      axios
        .post("/api/db", {
          query: term,
          limit: 250,
          page: this.page,
          filters: [{ type: this.activeDataType }],
          selector: this.selector
        })
        .then(
          res => {
            this.isLoading = false;
            this.isLoaded = true;
            this.total = res.data.total;
            this.names = res.data.items;
          },
          err => {
            this.isLoading = false;
            this.isLoaded = true;
            this.total = 0;
            this.names = [];
          }
        );
    },
    sortMe(eve) {
      if (this.filterSort == "asc") {
        this.filterSort = "dec";
      } else {
        this.filterSort = "asc";
      }
      this.columnSort = eve.column;

      this.goSearch();
    },
    highlightTerm(t) {
      if (this.lastTerm == "") {
        return t;
      }
      console.log(t);
      if (t == null) {
        return t;
      }
      let nterm = this.lastTerm.replace(/[()-]/g, "");
      nterm = nterm.replace(/\s+/g, "");
      let text = nterm;

      // t = t.replace(/[.*+?^${}()|[\]\\\s-]/g, '');

      t = t.replace(
        new RegExp(text, "gi"),
        str => `<span class='highlight'>${str}</span>`
      );

      return this.formatPhone(t);
      // var innerHTML = t.toString();
      // var index = innerHTML.indexOf(text);
      // if (index >= 0) {
      // innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
      // console.log(innerHTML);

      // }
      // console.log(innerHTML);
      // return innerHTML;
    },
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
        field: this.searchField,
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
        type: "all",
        page: this.page,
        creditor: this.$store.state.userStore.user.creditor
      };
      axios.post("/api/clients/search", post).then(res => {
        this.clients = res.data.items;
        this.total = res.data.total;
        this.isLoaded = true;
      });
    },
    getDataType(filter, i) {
      console.log(filter);
      this.activeFilter = this.columns.filter(item => item.value == filter)[0];
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
      // this.isLoaded = false;

      this.lastTerm = this.term;
      this.getNames();
      // axios
      //   .post("/api/clients/search", {
      //     field: this.searchField,
      //     term: this.term,
      //     page: this.page,
      //     sortName: this.columnSort,
      //     sort: this.filterSort,
      //     filters: this.filters,
      //     creditor: this.$store.state.userStore.user.creditor,
      //     type: "all"
      //   })
      //   .then(res => {
      //     this.clients = res.data.items;
      //     this.total = res.data.total;
      //     this.isLoaded = true;
      //   });
    },
    formatPhone(phoneNumberString) {
      if (phoneNumberString.length == 7) {
        var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
        var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return "(" + match[1] + ") " + match[2] + "-" + match[3];
        }
      } else {
        return phoneNumberString;
      }
    },
    formatDate(date2) {
      if (new Date(date2) < new Date("1970-12-30")) {
        return "";
      } else {
        return moment(date2).format("MM/DD/YYYY");
      }
    }
  },
  components: {
    Lottie
  },
  computed: {
    searchColumns() {
      return [
        { label: "Account Number", value: "account_number" },
        { label: "Name", value: "name" },
        { label: "Address", value: "address" },
        { label: "Phone Numbers", value: "phone" }
      ];
    },
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
        { label: "Titles", value: "titles", type: "number" },
        {
          label: "Header Type",
          value: "header_type",
          options: ["personal", "corporate"],
          type: "string"
        }
      ];
    },
    columnLabels() {
      // return this.columns.map((item, i) => {
      //   return item.value;
      // });

      var columns = [
        "name",
        "phone",
        "cellphone",
        "city",
        "state",
        "account_number",
        "creditor",
        "date_of_notice",
        "creditors_total_due"
      ];
      if (this.filter != "") {
        columns.push(this.filter.toLowerCase().replace(" ", "_"));
      }
      return columns;
    },
    options() {
      return {
        perPage: 250,
        sortIcon: {
          base: "fa",
          up: "fa-caret-down",
          down: "fa-caret-up",
          is: ""
        },
        sortingAlgorithm: (data, column) => {
          return data;
        }
      };
    }
  }
};
</script>
<style>
.searchBarDropdown {
  max-width: 150px;
  min-width: 150px;
  height: 40px;
  display: flex;

  align-items: center;
  justify-content: center;
  margin-left: 10px;
  background: #5050d1;
  cursor: pointer;
  color: #fff;
  user-select: none;
}

.list {
  padding: 15px;
  cursor: pointer;
}

.activator {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: capitalize;
  transition: all 0.3s ease;
  user-select: none;
}

.activator:hover {
  background: #5050d1;
}
tr td:nth-child(1) {
  width: 80px;
}
.VueTables__sort-icon {
  margin-left: 10px;
}
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
.highlight {
  background-color: #f5f0d2;
  border-radius: 4px;
  padding: 0px 1px;
}
.fieldSelect {
  background: #f5f5f5;
  border-radius: 4px;
  margin-right: 10px;
  padding: 10px;
  height: 60px;
}
.VueTables__sortable {
  cursor: pointer !important;
}
</style>