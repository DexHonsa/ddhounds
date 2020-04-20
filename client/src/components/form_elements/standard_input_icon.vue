<template>
  <div class="standard-input-item" :style="'max-width:'+width">
    <div>
      <div class="standard-input-title">{{field}}</div>
      <div class="input-icon">
        <i class="fa" :class="icon"></i>
      </div>
      <input
        @input="inputChange"
        @focus="inputFocus"
        @blur="inputBlur"
        style="padding-left:40px"
        :autocomplete="name"
        data-vv-value-path="dValue"
        :data-vv-as="field"
        v-validate="isRequired"
        v-model="inputValue"
        :placeholder="placeholder"
        ref="input"
        :class="{'input': true, 'is-danger': errors.has(name) }"
        :id="id"
        :type="type"
        :value="value"
        :name="name"
        class="standard-input"
      >
      <span v-show="errors.has(name)" class="help is-danger">{{ errors.first(name) }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "",
  data: () => ({
    isRequired: "",
    inputValue: "",
    confirm: false
  }),
  inject: ["$validator"],
  props: [
    "type",
    "width",
    "name",
    "field",
    "required",
    "placeholder",
    "value",
    "id",
    "icon",
    "passwordConfirm",
    "onChange",
    "onFocus"
  ],
  mounted() {
    this.inputValue = this.value;
    if (this.required) {
      this.isRequired = "required";
    }
    if (this.passwordConfirm) {
      this.isRequired = "required|confirmed:password";
    }
  },
  watch: {
    value(val) {
      console.log("changed");
      this.inputValue = val;
    }
  },
  methods: {
    inputChange() {
      if (this.onChange) {
        this.onChange(this.$refs.input.value);
      }
    },
    inputFocus() {
      if (this.onFocus) {
        this.onFocus(true);
      }
    },
    inputBlur() {
      if (this.onFocus) {
        this.onFocus(false);
      }
    }
  }
};
</script>
<style>
.input-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  color: #242427;
  width: 40px;
  margin: 5px;
}
</style>

