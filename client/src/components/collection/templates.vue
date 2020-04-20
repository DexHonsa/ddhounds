<template>
  <div>
    <modal v-if="saveEmailTemplate" :title="'Save Email Template'">
      <div slot="content" class="basic-btn" @click="toggleSaveTemplate('email')">Hide me</div>
    </modal>
    <div class="inner-stage">
      <div class="container">
        <div class="template-type-container">
          <div
            @click="activateTemplate('email')"
            class="template-type-item"
            :class="{'active':activeTemplate == 'email'}"
          >
            <i class="fa fa-envelope"></i>
            <div>Email</div>
          </div>
          <div
            @click="activateTemplate('sms')"
            class="template-type-item"
            :class="{'active':activeTemplate == 'sms'}"
          >
            <i class="fa fa-phone"></i>
            <div>SMS</div>
          </div>
          <div
            @click="activateTemplate('letter')"
            class="template-type-item"
            :class="{'active':activeTemplate == 'letter'}"
          >
            <i class="fa fa-envelope-open"></i>
            <div>Letter</div>
          </div>
        </div>
        <transition-group
          style="position:relative;width:100%; display:block;"
          mode="out-in"
          enter-active-class="fadeInDown"
          leave-active-class="fadeOutDown"
        >
          <div :key="0" class="box animated-fast" v-show="activeTemplate == 'email'">
            <div class="basic-title">Email Template</div>
            <div class="box-content">
              <editor-menu-bar :editor="editor">
                <div
                  class="menubar is-hidden"
                  :class="{ 'is-focused': focused }"
                  slot-scope="{ commands, isActive, focused }"
                >
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.bold() }"
                    @click="commands.bold"
                  >
                    <i class="fa fa-bold"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.italic() }"
                    @click="commands.italic"
                  >
                    <i class="fa fa-italic"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.strike() }"
                    @click="commands.strike"
                  >
                    <i class="fa fa-strikethrough"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.underline() }"
                    @click="commands.underline"
                  >
                    <i class="fa fa-underline"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.code() }"
                    @click="commands.code"
                  >
                    <i class="fa fa-code"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.paragraph() }"
                    @click="commands.paragraph"
                  >
                    <i class="fa fa-paragraph"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                    @click="commands.heading({ level: 1 })"
                  >H1</button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.heading({ level: 2 }) }"
                    @click="commands.heading({ level: 2 })"
                  >H2</button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.heading({ level: 3 }) }"
                    @click="commands.heading({ level: 3 })"
                  >H3</button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.bullet_list() }"
                    @click="commands.bullet_list"
                  >
                    <i class="fa fa-list-ul"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.ordered_list() }"
                    @click="commands.ordered_list"
                  >
                    <i class="fa fa-list-ol"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.blockquote() }"
                    @click="commands.blockquote"
                  >
                    <i class="fa fa-quote-right"></i>
                  </button>
                  
                  <button
                    class="menubar__button"
                    :class="{ 'is-active': isActive.code_block() }"
                    @click="commands.code_block"
                  >
                    <icon name="code"/>
                  </button>
                </div>
              </editor-menu-bar>

              <editor-content class="editor__content" :editor="editor"/>
              <div style="display:flex;">
                <div
                  style="margin-left:auto; margin-top:115px; width:100%;"
                  class="basic-btn"
                  @click="toggleSaveTemplate('email')"
                >Save Template</div>
              </div>
            </div>
          </div>

          <div
            :key="1"
            class="template-content-container animated-fast"
            v-show="activeTemplate == 'sms'"
          >PHONE TEMPLATE</div>

          <div
            :key="2"
            class="template-content-container animated-fast"
            v-show="activeTemplate == 'letter'"
          >LETTER TEMPLATE</div>
        </transition-group>
      </div>
    </div>
  </div>
</template>
<script>
import Icon from "./icon";
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import Modal from "../helpers/modal";
import {
  Blockquote,
  BulletList,
  CodeBlock,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Image,
  Link,
  Strike,
  Underline,
  History
} from "tiptap-extensions";
export default {
  name: "templates",
  data() {
    return {
      saveEmailTemplate: false,
      activeTemplate: "",
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Image(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
          new Strike(),
          new Underline(),
          new History()
        ],
        content: `
          <h2>
            Hiding Menu Bar
          </h2>
          <p>
            Click into this text to see the menu. Click outside and the menu will disappear. It's like magic.
          </p>
        `
      })
    };
  },
  mounted() {
    // this.editor = new Editor({
    //   content: "<p>This is just a boring paragraph</p>"
    // });
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
    Modal
  },
  methods: {
    activateTemplate(template) {
      this.activeTemplate = template;
    },
    toggleSaveTemplate(template) {
      console.log(template);
      if (template == "email") {
        this.saveEmailTemplate = !this.saveEmailTemplate;
      }
    }
  }
};
</script>
<style>
.template-type-container {
  display: flex;
  margin: -5px;
  margin-bottom: 15px;
}
.template-type-item {
  flex: 1;
  border: solid 1px #24d7a0;
  border-radius: 3px;
  margin: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  font-size: 15pt;
  color: #1b495d;
  transition: all 0.1s ease;
  cursor: pointer;
  background: #fff;
}
.template-type-item i {
  font-size: 35pt;
  margin-bottom: 15px;
  color: #24d7a0;
  transition: all 0.1s ease;
}
.template-type-item:hover,
.template-type-item.active {
  background: #24d7a0;
  color: #fff !important;
}
.template-type-item:hover i,
.template-type-item.active i {
  color: #fff !important;
}
.template-content-container {
  background: #e8eaec;
  padding: 15px;
  width: 100%;
  top: 0;
  position: absolute;
}
</style>