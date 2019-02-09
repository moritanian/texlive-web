<template>
  <div class="file-item"
    @click="onClickHandler"
    @contextmenu.prevent="onContextmenuHandler"
    :class="{selected: selected}">
    <div class="icon">
      <img width="30" height="30" :src="fileIconUrl" :alt="name">
    </div>
    <div class="name-text" v-show="mode===DEFAULT_MODE">{{name}}</div>
    <input class="name-text-input"
      v-show="mode===RENAME_MODE"
      :value="name" @input="onChangeInput"
      v-on:keyup.enter="onEnterInput">
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
    onClickItem: Function,
    onContextmenu: Function,
    onRename: Function,
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
    onClickHandler () {
      if (this.onClickItem) {
        this.onClickItem(this.name)
      }
    },
    onContextmenuHandler (e) {
      if (this.onContextmenu) {
        this.onContextmenu(e, this.name)
      }
    },
    onEnterInput (e) {
      if (this.onRename) {
        this.onRename(this.name, this.nameInputValue)
      }
    },
    onChangeInput (e) {
      this.nameInputValue = e.target.value
    }
  }
}

</script>

<style scoped lang='scss'>
.file-item {
  position: relative;
  padding: 2px 0px;

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
    user-select: none;
  }

  .name-text-input {
    border: none;
    height: 17px;
    line-height: 17px;
    text-decoration: none;
    padding-left: 4px;
    font-size: 12px;
  }

  &after {
   clear: both;
  }
}

</style>
