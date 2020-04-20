<template>
  <div
    v-bind:class="{'overlay animated-fast fadeIn':visible,'overlay animated-fast fadeOut':!visible}"
  >
    <div
      v-bind:class="{'modal-1 animated-fast zoomIn':visible,'modal-1 animated-fast zoomOut':!visible}"
      style="max-width:800px;"
    >
      <div class="modal-top">
        <div class="modal-title">PDF</div>
      </div>
      <div style="max-height:80vh; overflow:auto;" class="modal-inner">
        <div style=" display:flex; padding:15px; justify-content:center;">
          <img
            style="max-width:700px; width:100%; box-shadow:0px 10px 15px 0px rgba(0,0,0,0.5);"
            :src="`/api/static/${activeViewMail.client_id}/${activeViewMail._id}.jpg`"
            alt
          />
        </div>
        <div class="modal-btn-container">
          <v-btn
            @click="toggleVisible"
            dark
            small
            :color="$vuetify.theme.lightGreen"
            style="margin:0;"
          >Ok</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "view_mail",
  props: ["hide", "activeViewMail"],
  data() {
    return {
      visible: true
    };
  },
  mounted() {
    var app = window.document.getElementById("app");
    app.appendChild(this.$el);
  },
  methods: {
    toggleVisible() {
      var that = this;
      this.visible = false;
      setTimeout(function() {
        that.hide();
      }, 300);
    }
  }
};
</script>

<style>
</style>
