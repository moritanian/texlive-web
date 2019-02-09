<template>
  <div>

    <div class="children" :class="{root: isRoot}">

      <!-- Sub directories -->
      <template v-for="(file, index) in fileList">
        <upload-panel
          v-bind:key="`upload-${index}`"
          :fullPath="file.isDirectory ? getFullPath(file.name) : fullPath">
          <file-item :name="file.name"
            :isDirectory="file.isDirectory"
            :open="file.open"
            @clickitem="onClickItem"
            @contextmenu="onContextmenu"
            @rename="onRequestRename"
            :mode="file.mode"
             :selected="selectedItemName===getFullPath(file.name)"
            ></file-item>
        </upload-panel>

        <directory-tree
          v-if="file.isDirectory"
          v-show="file.open"
          class="directory"
          v-bind:key="`tree-${index}`"
          :env="env"
          :fullPath="getFullPath(file.name)"
          :selectedItemName="selectedItemName">
        </directory-tree>
      </template>

    </div>

    <!-- Context menu -->
    <context-menu ref="fileCtxMenu" class="context-menu">
      <li @click="onClickContextmenuRename"> rename </li>
      <li @click="onClickContextmenuDelete"> delete </li>
    </context-menu>

     <!-- Folder context menu -->
    <context-menu ref="folderCtxMenu" class="context-menu">
      <li @click="onClickContextmenuNewFile"> new file </li>
      <li @click="onClickContextmenuNewFolder"> new folder </li>
      <li @click="onClickContextmenuRename"> rename folder </li>
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
    env: {
      type: Object,
      required: true
    },
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
    },
    newFileName: {
      type: String,
      default: 'untitled'
    },
    newFolderName: {
      type: String,
      default: 'untitled'
    }
  },
  data () {
    return {
      open: true,
      fileList: [],
      contextMenuTarget: null,
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
    contextMenuTargetFullPath () {
      return this.getFullPath(this.contextMenuTarget)
    },
    RENAME_MODE: () => RENAME_MODE
  },
  methods: {
    update () {
      this.fileList = []

      this.fs.readdir(this.fullPath, (err, files) => {
        if (err) {
          console.log(err)
          return
        }
        this.fromFiles(files)
      })
    },
    fromFiles (files) {
      console.log(files)
      this.fileList = files.filter(fileName => {
        return fileName && fileName[0] !== '.'
      }).map(fileName => {
        var fullPath = this.path.join(this.fullPath, fileName)
        var stats = this.fs.statSync(fullPath)

        return {
          name: fileName,
          mode: DEFAULT_MODE,
          isDirectory: stats.isDirectory(),
          open: true
        }
      }).sort((fileA, fileB) => {
        if (fileA.isDirectory === fileB.isDirectory) {
          return fileA.name > fileB.name ? 1 : -1
        } else {
          return fileA.isDirectory ? -1 : 1
        }
      })
    },
    onClickItem (e, fileName, mode, isDirectory) {
      return isDirectory ? this.onClickFolderItem(e, fileName, mode) : this.onClickFileItem(e, fileName, mode)
    },
    onClickFileItem (e, fileName, mode) {
      if (mode === DEFAULT_MODE) {
        this.$store.dispatch(FILE_OPEN_ACTION, {name: fileName, directoryFullPath: this.fullPath, env: this.env})
      }
    },
    onClickFolderItem (e, folderName, mode) {
      var folderData = this.getFileData(folderName)
      folderData.open = !folderData.open
    },
    onContextmenu (e, name, isDirectory) {
      return isDirectory ? this.onFolderContextmenu(e, name) : this.onFileContextmenu(e, name)
    },
    onFileContextmenu (e, name) {
      this.onClickFileItem(e, name, DEFAULT_MODE)
      this.contextMenuTarget = name
      this.$refs.fileCtxMenu.open()
    },
    onFolderContextmenu (e, name) {
      this.contextMenuTarget = name
      this.$refs.folderCtxMenu.open()
    },
    onClickContextmenuRename (e) {
      var fileData = this.getFileData(this.contextMenuTarget)
      fileData.mode = RENAME_MODE
    },
    onClickContextmenuDelete (e) {
      if (!this.contextMenuTarget) {
        return
      }

      this.fs.unlink(this.contextMenuTargetFullPath, (err) => {
        if (err) {
          console.log(err)
          return
        }

        this.update()
      })

      this.contextMenuTarget = null
    },
    onClickContextmenuDeleteFolder (e) {
      if (!this.contextMenuTarget) {
        return
      }

      this.fs.rmdir(this.contextMenuTargetFullPath, (err) => {
        if (err) {
          console.log(err)
          return
        }

        this.update()
      })

      this.contextMenuTarget = null
    },
    onClickContextmenuNewFile (e) {
      const fileName = 'untitled'
      const filePath = this.path.join(this.contextMenuTargetFullPath, fileName)
      console.log(filePath)
      this.fs.writeFile(filePath, '', (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    onClickContextmenuNewFolder (e) {
      var directoryName = 'new'

      this.fs.mkdir(this.path.join(this.contextMenuTargetFullPath, directoryName), 0o777, (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    onRequestRename (e, oldName, newName, isDirectory) {
      return isDirectory ? this.renameFolder(oldName, newName) : this.renameFile(oldName, newName)
    },
    renameFile (oldName, newName) {
      this.fs.rename(this.getFullPath(oldName), this.getFullPath(newName), (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update()
      })
    },
    renameFolder (oldName, newName) {
      this.fs.rename(this.getFullPath(oldName), this.getFullPath(newName), (err) => {
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
    },
    getFileData (name) {
      var filtered = this.fileList.filter((file) => file.name === name)

      if (filtered.length !== 1) {
        console.warn('Something error happened.')
      }

      return filtered[0]
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
