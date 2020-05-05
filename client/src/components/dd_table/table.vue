<template>
  <div style="width:calc(100vw - 100px);">
    <transition enter-active-class="fadeInUp" leave-active-class="fadeOut">
      <div v-if="!isLoaded" class="loaderContainer animated-fast">
        <img src="@/img/double_loader.svg" alt />
      </div>
    </transition>
    <div style="margin-bottom:25px;">
      <div class="name"></div>
    </div>
    <div class="table-container">
      <v-client-table :options="options" :data="tableData" :columns="columns">
        <div
          
          slot="guess_override"
          slot-scope="props"
        ><input type="text" v-model="tableData[props.index - 1].guess_override" class="override"></div>
        <div
          
          slot="notes"
          slot-scope="props"
        ><input type="text" class="override"></div>
      </v-client-table>
    </div>
  </div>
</template>
<script>
export default {
  name: "table",
  data() {
    return {
      isLoaded: false,

      options: {
        resizeableColumns:false,
        cellClasses: {
          guess_override: [
            {
              class: "guess",
              condition: row => row.guess_override != ''
            }
          ],
          ddhounds_best_guess: [
            {
              class: "best_guess",
              condition: row => true
            }
          ]
        },


      }
    };
  },
  mounted() {
    this.isLoaded = true;
  },
  computed: {
    tableData() {
      return [
        {
          search_name: "Marvel Entertainment",
          usco_name: "Marvel Entertainment Group, Inc.​",
          "recorded_document_#": "V3432D030​",
          "entry_#": "#161",
          linked_title_phase_2: "1994 Fleer Extra Bases ​",
          ddhounds_best_guess: "VA0000683368",
          guess_override: "VA0000683368",
          ddhounds_notes: "",
          notes: "I confirmed this is correct on Date​"
        },
 
      ];
    },
    columns() {
      return [
        "search_name",
        "usco_name",
        "recorded_document_#",
        "entry_#",
        "linked_title_phase_2",
        "ddhounds_best_guess",
        "guess_override",
        "ddhounds_notes",
        "notes"
      ];
    }
  }
};
</script>
<style>
.override{
    background:transparent;
    outline:none;
    font-weight: bold;
}
.override:focus{
    outline: none;
}
.container {
  padding: 55px;
}
.table-container {
    width:100%;

  font-size: 13pt;
}
.table-container table thead tr th {
  white-space: nowrap;
}
.table-container table tbody td {
  padding: 20px 20px !important;
  position: relative;
}
.guess{
    background:#e1f1e8 !important;
    border:solid 1px #b6dbc6 !important;
    color:teal
}
.best_guess{
    background:#e1e9f1 !important;
    border:solid 1px #b6c5db !important;
    color:rgb(0, 87, 128);
    font-weight: bold;
}
</style>