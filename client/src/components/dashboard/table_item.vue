<template>
  <div>{{data}}</div>
</template>
<script>
export default {
  name: "table_item",
  props: ["data", "index", "column"],
  methods: {
    erase() {
      let id = this.data.id; // delete the item
    }
  }
};
</script>