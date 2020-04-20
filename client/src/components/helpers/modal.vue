<template lang="html">
  <div v-bind:class="{'overlay animated-fast fadeIn':visible,'overlay animated-fast fadeOut':!visible}" >
    <div v-bind:class="{'modal-1 animated-fast zoomIn':visible,'modal-1 animated-fast zoomOut':!visible}" style="width: 400px">
      <div class="modal-top">
        <div class="modal-title"> {{title}} </div>
        <div @click="toggleVisible" class="modal-close"><img src="../../img/close.svg"/></div>
      </div>
      <div class="modal-inner">
        <slot name="content"></slot>
      </div>
    </div>
    </div>
</template>

<script>
export default {
  name: "modal-1",
  props: ["title", "hide", "del"],
  data() {
    return {
      visible: true
    };
  },
  //   beforeDestroy() {
  //     var app = window.document.getElementById("app");
  //     app.removeChild(this.$el);
  //   },
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
