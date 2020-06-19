<template>
  <div style="width:calc(100vw - 100px);">
    <v-dialog v-model="upload" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Upload a file</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <input ref="uploadFile" type="file" />
              </v-flex>
            </v-layout>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="upload = false">Close</v-btn>
          <v-btn color="blue darken-1" flat @click="onUpload">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
      <div v-if="!isLoaded" class="loaderContainer animated-fast">
        <img src="@/img/double_loader.svg" alt />
      </div>
    </transition>
    <div style="margin-bottom:25px;">
      <div class="name"></div>
    </div>
    <div>
      <v-btn @click="download" dark :color="$vuetify.theme.lightGreen">Download</v-btn>
      <v-btn @click="upload = true" dark :color="$vuetify.theme.lightGreen">Upload</v-btn>
    </div>
    <div class="table-container">
      <v-client-table :options="options" :data="tableData" :columns="columns">
        <div
          slot="h__Parent Search or Matter Number for reference"
          style="width:200px;white-space:pre-wrap; vertical-align:bottom"
        >Parent Search or Matter Number for reference</div>
        <div slot="Internal Comments" slot-scope="props">
          <textarea
            type="text"
            v-model.lazy="tableData[tableData.findIndex((item)=>item.ID == props.row.ID)]['Internal Comments']"
            class="override"
          />
        </div>
        <div slot="Comments for Chain of Title" slot-scope="props">
          <textarea
            type="text"
            v-model.lazy="tableData[tableData.findIndex((item)=>item.ID == props.row.ID)]['Comments for Chain of Title']"
            class="override"
          />
        </div>

        <!--<div slot="notes" slot-scope="props">
          <input type="text" class="override" />
        </div>-->
        <div
          slot="Search Name"
          style="white-space:nowrap"
          slot-scope="props"
        >{{props.row['Search Name']}}</div>
      </v-client-table>
    </div>
  </div>
</template>
<script>
import axios from "axios";
export default {
  name: "table",
  data() {
    return {
      isLoaded: false,
      tableData: [],
      columns: [],
      options: {
        perPage: 100,
        pagination: { dropdown: true, show: true, nav: "fixed" },
        resizeableColumns: true,
        cellClasses: {
          "Internal Comments": [
            {
              class: "guess",
              condition: row => row.guess_override != ""
            }
          ],
          "Comments for Chain of Title": [
            {
              class: "best_guess",
              condition: row => true
            }
          ]
        }
      }
    };
  },
  mounted() {
    this.getData();
  },
  computed: {},
  methods: {
    async onUpload() {
      let file = this.$refs.uploadFile.files[0];
      let formData = new FormData();
      formData.append("file", file, "editable_transferable.xlsx");
      let group = this.active;

      axios.post("/api/upload", formData).then(
        res => {
          window.location.reload();
        },
        err => {
          window.alert(err.response.stringify());
        }
      );
    },
    download() {
      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "https://ddhounds.com/api/static/editable_transferable.xlsx"
      );
      element.setAttribute("download", "editable_transferable.xlsx");

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    getData() {
      this.isLoaded = false;
      axios.get("/api/editableTransferable").then(res => {
        this.columns = ["ID", ...res.data.headers];
        let reducer = (accumulator, currentValue, idx) => {
          let obj = { ...accumulator };

          obj[this.columns[idx + 1]] = currentValue;

          return obj;
        };
        for (let i = 0; i < res.data.items.length; i++) {
          if (res.data.items[i].length > 0) {
            res.data.items[i] = {
              ID: i + 1,
              ...res.data.items[i].reduce(reducer)
            };
          }
        }
        this.tableData = res.data.items;

        this.isLoaded = true;
      });
    }
  }
};
</script>
<style>
.override {
  background: transparent;
  outline: none;
  font-weight: bold;
}
.override:focus {
  outline: none;
}
.container {
  padding: 55px;
}
.table-container {
  width: 100%;

  font-size: 11pt;
}
.table-container table thead tr th {
  white-space: nowrap;
}
.table-container table tbody td {
  padding: 0px 20px !important;
  position: relative;
}
.guess {
  background: #e1f1e8 !important;
  border: solid 1px #b6dbc6 !important;
  color: teal;
}
.best_guess {
  background: #e1e9f1 !important;
  border: solid 1px #b6c5db !important;
  color: rgb(0, 87, 128);
  font-weight: bold;
}
</style>