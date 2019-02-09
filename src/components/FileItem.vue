<template>
  <div class="file-item"
    @click="onClick"
    @contextmenu.prevent="onContextmenu"
    :class="{selected: selected}">
    <div class="icon">
      <img width="30" height="30" :src="fileIconUrl" :alt="name">
    </div>
    <div class="name-text" v-show="mode===DEFAULT_MODE">{{name}}</div>
    <input class="name-text-input"
      v-show="mode===RENAME_MODE"
      :value="name" @input="onChangeInput"
      v-on:keyup.enter="onEnterInput"
      v-focus="mode===RENAME_MODE">
  </div>
</template>
<script>

import {isImageFile} from './../util/util'
const imageIconUrl = require('./../assets/image-icon.svg')
const fileIconUrl = require('./../assets/file-icon.svg')
const selectedFileIconUrl = require('./../assets/selected-file-icon.svg')
const closeFolderIconUrl = require('./../assets/folder-icon.svg')
const openFolderIconUrl = require('./../assets/open-folder-icon.svg')

export const DEFAULT_MODE = 'DEFAULT_MODE'
export const RENAME_MODE = 'RENAME_MODE'

export default {
  name: 'FileItem',
  props: {
    name: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: DEFAULT_MODE
    },
    selected: {
      type: Boolean,
      default: false
    },
    isDirectory: {
      type: Boolean,
      default: false
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      nameInputValue: ''
    }
  },
  computed: {
    fileIconUrl () {
      var url = ''
      if (this.isDirectory) {
        if (this.open) {
          url = openFolderIconUrl
        } else {
          url = closeFolderIconUrl
        }
      } else if (isImageFile(this.name)) {
        url = imageIconUrl
      } else if (this.selected) {
        url = selectedFileIconUrl
      } else {
        url = fileIconUrl
      }
      return url
    },
    DEFAULT_MODE: () => DEFAULT_MODE,
    RENAME_MODE: () => RENAME_MODE
  },
  methods: {
    onClick (e) {
      console.log('click')
      this.$emit('clickitem', e, this.name, this.mode, this.isDirectory)
    },
    onContextmenu (e) {
      this.$emit('contextmenu', e, this.name, this.isDirectory)
    },
    onEnterInput (e) {
      this.$emit('rename', e, this.name, this.nameInputValue, this.isDirectory)
    },
    onChangeInput (e) {
      this.nameInputValue = e.target.value
    }
  },
  directives: {
    focus: {
      update (el, binding) {
        if (binding.value) {
          el.focus()
        } else {
          el.blur()
        }
      }
    }
  },
}

</script>

<style scoped lang='scss'>
.file-item {
  position: relative;
  padding: 2px 0px;
  height: 24px;
  user-select: none;

  &.selected {
    background-color: #a7a7a7;
    font-weight: bold;
    color: black;
  }

  &:hover {
    background-color: #989898;
    color: white;
  }

  .icon {
    left: 2px;
    float: left;

    img {
      width: 20px;
      height: 20px;
      display: inline-block;
      vertical-align: top;
    }
  }

  .name-text {
    cursor: default;
    text-align: left;
    margin-left: 25px;
  }

  .name-text-input {
    height: 17px;
    line-height: 17px;
    text-decoration: none;
    padding-left: 4px;
    font-size: 12px;
    min-width: 20px;
    width: 70%;
    max-width: 120px;
    display: block;
  }

  &after {
   clear: both;
  }
}

</style>
