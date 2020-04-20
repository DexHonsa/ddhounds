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
    <!-- <v-tooltip top>
      <span>Add Client</span>
      <v-btn
        slot="activator"
        fab
        depressed
        small
        :color="$vuetify.theme.lightGreen"
        dark
        @click="$router.push('clients/add')"
      >
        <i class="fa fa-plus"></i>
      </v-btn>
    </v-tooltip>-->
    <v-text-field @change="goSearch" label="Search">
      <template v-slot:prepend-inner>
        <i class="fa fa-search"></i>
      </template>
    </v-text-field>
    <div>Total Records: {{total}}</div>
    <v-client-table v-if="isLoaded" :data="clients" :columns="columns" :options="options">
      <div slot="account_number" style="max-width:100px;" slot-scope="{row}">{{row.account_number}}</div>
      <div slot="phone" slot-scope="{row}">{{formatPhone(row.phone)}}</div>
      <div slot="address" style="text-transform:uppercase" slot-scope="{row}">{{row.address}}</div>
      <div
        @click="$router.push('clients/' + row._id)"
        style="display:flex; cursor:pointer; align-items:center;"
        slot="name"
        slot-scope="{row}"
      >
        <i style="color:#47c3ad" class="fa fa-user-circle"></i>

        <div class="clickName" style="margin-left:10px;text-transform:uppercase">{{row.name}}</div>
      </div>

      <div style="display:flex; align-items:center;" slot="date_of_notice" slot-scope="{row}">
        <div>{{formatDate(row.date_of_notice)}}</div>
      </div>
    </v-client-table>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "disputes",
  data() {
    return {
      clients: [],
      total: 0,
      isLoaded: false
    };
  },
  mounted() {
    this.getClients();
  },
  methods: {
    goSearch(term) {
      this.isLoaded = false;
      axios
        .post("/api/clients/search", { term, page: 1, type: "Owed" })
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
        .post("/api/clients/search", { term: "", page: 1, type: "Owed" })
        .then(res => {
          this.clients = res.data.items;
          this.total = res.data.total;
          this.isLoaded = true;
        });
    }
  },
  computed: {
    columns() {
      return [
        "account_number",
        "name",
        "address",
        "phone",
        "date_of_notice",
        "creditors_total_due"
      ];
    },
    options() {
      return {};
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
</style>