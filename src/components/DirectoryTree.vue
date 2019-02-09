<template>
  <div>

    <file-item :name="directory"
      :isDirectory="true"
      :open="open"
      @clickitem="onClickFolderItem"
      @contextmenu="onContextmenuFolder"
      @rename="onRenameFolder"
      :mode="folderItemMode"
      :selected="folderItemMode===RENAME_MODE"
      v-if="!isRoot"
      ></file-item>

    <div class="children" :class="{root: isRoot}"
      v-show="open">

      <!-- Sub directories -->
      <transition name="leaf-transition">
        <directory-tree
          class="directory"
          v-for="(subDirectory, index) in subDirectories" :key="index"
          :env="env"
          :fullPath="getFullPath(subDirectory)"
          :selectedItemName="selectedItemName">
        </directory-tree>
      </transition>

      <!-- Files -->
      <upload-panel :fullPath="fullPath">
        <file-item v-for="(file, index) in fileList"
          :key="index" :name="file.name"
          @click="onClickFileItem"
          @clickitem="onClickFileItem"
          @contextmenu="onContextmenu"
          @rename="onRename"
          :mode="file.mode"
          :selected="selectedItemName===getFullPath(file.name)"></file-item>
      </upload-panel>

    </div>

    <!-- Context menu -->
    <context-menu ref="ctxMenu" class="context-menu">
      <li @click="onClickContextmenuRename"> rename </li>
      <li @click="onClickContextmenuDelete"> delete </li>
    </context-menu>

     <!-- Folder context menu -->
    <context-menu ref="folderCtxMenu" class="context-menu">
      <li @click="onClickContextmenuNewFile"> new file </li>
      <li @click="onClickContextmenuNewFolder"> new folder </li>
      <li @click="onClickContextmenuRenameFolder"> rename folder </li>
      <li @click="onClickContextmenuDeleteFolder"> delete folder</li>
    </context-menu>

  </div>
</template>
<script>
import UploadPanel from '../components/UploadPanel.vue'
import FileItem, {DEFAULT_MODE, RENAME_MODE} from '../components/FileItem.vue'
import { FILE_OPEN_ACTION } from '../store/modules/file_system'
import ContextMenu from 'vue-context-menu'

export default {
  name: 'DirectoryTree',
  components: {FileItem, UploadPanel, ContextMenu},
  props: {
    env: Object,
    fullPath: {
      type: String,
      default: '/'
    },
    selectedItemName: {
      type: String,
      default: null
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      open: true,
      subDirectories: [],
      fileList: [],
      contextMenuTarget: null,
      folderItemMode: DEFAULT_MODE
    }
  },
  created () {
    this.fs = this.env.require('fs')
    this.path = this.env.require('path')
  },
  mounted () {
    this.update()
  },
  computed: {
    directory () {
      return this.path.parse(this.fullPath).name || '/'
    },
    RENAME_MODE: () => RENAME_MODE
  },
  methods: {
    toggle () {
      this.open = !this.open
    },
    update () {
      this.fs.readdir(this.fullPath, (err, files) => {
        if (err) {
          console.log(err)
          return
        }
        this.fromFiles(files)
      })
    },
    fromFiles (files) {
      var subDirectories = []
      var fileList = []

      files.filter(fileName => fileName).forEach(fileName => {
        var fullPath = this.path.join(this.fullPath, fileName)
        var stats = this.fs.statSync(fullPath)
        if (stats.isDirectory()) { // folder
          subDirectories.push(fileName)
        } else { // file
          fileList.push({
            name: fileName,
            mode: DEFAULT_MODE
          })
        }
      })

      this.subDirectories = subDirectories
      this.fileList = fileList
    },
    onClickFileItem (e, fileName, mode) {
      if (mode === DEFAULT_MODE) {
        this.$store.dispatch(FILE_OPEN_ACTION, {name: fileName, directoryFullPath: this.fullPath, env: this.env})
      }
    },
    onClickFolderItem () {
      this.toggle()
    },
    onContextmenu (e, name) {
      this.onClickFileItem(e, name, DEFAULT_MODE)
      this.contextMenuTarget = name
      this.$refs.ctxMenu.open()
    },
    onContextmenuFolder (e, name) {
      this.contextMenuTarget = name
      this.$refs.folderCtxMenu.open()
    },
    onClickContextmenuRename (e) {
      var filtered = this.fileList.filter((file) => file.name === this.contextMenuTarget)

      if (filtered.length !== 1) {
        console.warn('something error happened. Cannot rename')
      }

      filtered[0].mode = RENAME_MODE
    },
    onClickContextmenuRenameFolder (e) {
      this.folderItemMode = RENAME_MODE
    },
    onClickContextmenuDelete (e) {
      if (!this.contextMenuTarget) {
        return false
      }

      this.fs.unlink(this.getFullPath(this.contextMenuTarget), (err) => {
        if (err) {
          console.log(err)
          return
        }

        this.update()
      })

      this.contextMenuTarget = null
    },
    onClickContextmenuDeleteFolder (e) {
      this.fs.rmdir(this.fullPath, (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    onClickContextmenuNewFile (e) {
      const fileName = 'untitled'

      this.fs.writeFile(this.getFullPath(fileName), '', (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    onClickContextmenuNewFolder (e) {
      var directoryName = 'new'

      this.fs.mkdir(this.getFullPath(directoryName), 0o777, (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    onRename (e, oldName, newName) {
      this.fs.rename(this.getFullPath(oldName), this.getFullPath(newName), (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    onRenameFolder (e, oldName, newName) {
      var newPath = this.path.join(this.path.parse(this.fullPath).dir, newName)
      this.fs.rename(this.fullPath, newPath, (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    getFullPath (fileName) {
      return this.path.join(this.fullPath, fileName)
    },
    getFileItemMode (fileName) {
      return fileName === this.selectedItemName ? RENAME_MODE : DEFAULT_MODE
    }
  }
}

</script>

<style scoped lang='scss'>
.directory-text {
  text-align: left;
  position: relative;
  left: -6px;
}

.children {
  margin: 2px;
  padding-left: 5px;

  &.root {
     margin: 0px;
    padding-left: 0px;
  }
}

.context-menu {
  min-width: 120px;
  user-select: none;
  li {
    padding: 2px 0px 2px 10px;
    cursor: default;

    &:hover {
      background-color: rgb(210, 210, 210);
    }
  }
}
</style>
