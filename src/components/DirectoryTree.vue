<template>
  <div>

    <div class="children" :class="{root: isRoot}">

      <!-- Sub directories -->
      <template v-for="(file, index) in fileList">
        <upload-panel
          :env="env"
          v-bind:key="`upload-${index}`"
          :full-path="file.isDirectory ? getFullPath(file.name) : fullPath"
          @uploaded="update">
          <file-item :name="file.name"
            :isDirectory="file.isDirectory"
            :open="file.open"
            @clickitem="onClickItem"
            @contextmenu="onContextmenu"
            @rename="onRequestRename"
            :mode="file.mode"
            :selected="selectedItemName===getFullPath(file.name)"
            :full-path="getFullPath(file.name)"
            :notification="file.notification"
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
      <li @click="onClickContextmenuRename" style="border-top: solid #a0a0a0 1px"> rename folder </li>
      <li @click="onClickContextmenuDeleteFolder" style="border-top: solid #a0a0a0 1px"> delete folder</li>
      <li @click="onClickContextmenuDeleteFolderRecursive"> delete folder recursive</li>
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
    excludes: {
      type: Array,
      default: () => []
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
    update (force = false) {
      if (force) {
        this.fileList = []
      }

      this.fs.readdir(this.fullPath, (err, files) => {
        if (err) {
          console.log(err)
          return
        }
        this.fromFiles(files)
      })
    },
    fromFiles (files) {
      var fileList = files.filter(fileName => {
        return fileName && this.excludes.filter(exclude => fileName.match(exclude)).length === 0
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

      // update list and notify it to the vue system
      this.fileList.splice(0, this.fileList.length, ...fileList)
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
      var target = this.contextMenuTarget
      if (!target) {
        return
      }

      this.fs.unlink(this.contextMenuTargetFullPath, (err) => {
        if (err) {
          console.log(err)
          this.showItemNotificationTemporary(target, err.message)
          return
        }

        this.update()
      })

      this.contextMenuTarget = null
    },
    onClickContextmenuDeleteFolder (e) {
      var target = this.contextMenuTarget
      if (!target) {
        return
      }

      this.fs.rmdir(this.contextMenuTargetFullPath, (err) => {
        if (err) {
          console.log(err)
          this.showItemNotificationTemporary(target, err.message)
          return
        }

        this.update()
      })

      this.contextMenuTarget = null
    },
    onClickContextmenuDeleteFolderRecursive (e) {
      this.deleteFolderRecursive(this.contextMenuTargetFullPath).then(() => {
        this.update(true)
      }).catch((err) => {
        console.log(err)
        this.update(true)
      })
    },
    deleteFolderRecursive (targetPath, promises = Promise.resolve()) {
      var promise

      var stats = this.fs.statSync(targetPath)

      if (stats.isDirectory()) {
        var files = this.fs.readdirSync(targetPath)

        files.forEach((fileName) => {
          let fullPath = this.path.join(targetPath, fileName)
          promises = this.deleteFolderRecursive(fullPath, promises)
        })

        promise = () => {
          return new Promise((resolve, reject) => {
            this.fs.rmdir(targetPath, (err) => {
              if (err) {
                reject(err)
                return
              }
              resolve(targetPath)
            })
          })
        }
      } else {
        promise = () => {
          return new Promise((resolve, reject) => {
            this.fs.unlink(targetPath, (err) => {
              if (err) {
                reject(err)
                return
              }
              resolve(targetPath)
            })
          })
        }
      }

      promises = promises.then(promise)

      return promises
    },
    onClickContextmenuNewFile (e) {
      var fileName = this.newFileName
      var count = 1
      while (this.fs.existsSync(this.path.join(this.contextMenuTargetFullPath, fileName))) {
        fileName = `${this.newFileName}${count}`
        count++
      }
      const filePath = this.path.join(this.contextMenuTargetFullPath, fileName)

      this.fs.writeFile(filePath, '', (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update(true)
      })
    },
    onClickContextmenuNewFolder (e) {
      var folderName = this.newFolderName

      var count = 1
      while (this.fs.existsSync(this.path.join(this.contextMenuTargetFullPath, folderName))) {
        folderName = `${this.newFileName}${count}`
        count++
      }

      const folderPath = this.path.join(this.contextMenuTargetFullPath, folderName)
      this.fs.mkdir(this.path.join(folderPath), 0o777, (err) => {
        if (err) {
          console.log(err)
          return false
        }

        this.update(true)
      })
    },
    onRequestRename (e, oldName, newName, isDirectory) {
      // No change
      if (oldName === newName) {
        this.getFileData(oldName).mode = DEFAULT_MODE
        return
      }

      // Empty
      if (newName === '') {
        this.updateFileData(oldName, 'notification', `File name should not be empty`)
        return
      }

      // Already exist
      if (this.fs.existsSync(this.getFullPath(newName))) {
        this.updateFileData(oldName, 'notification', `${newName} is alreay exists`)
        return
      }

      return this.rename(oldName, newName)
    },
    rename (oldName, newName) {
      this.fs.rename(this.getFullPath(oldName), this.getFullPath(newName), (err) => {
        if (err) {
          console.log(err)
          this.updateFileData(oldName, 'notification', err.message)
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
        return null
      }

      return filtered[0]
    },
    updateFileData (fileName, key, value) {
      var index = this.fileList.indexOf(this.fileList.filter((file) => file.name === fileName)[0])
      if (index === -1) {
        return false
      }

      var fileData
      if (value !== undefined) { // update only one property
        fileData = this.fileList[index]
        fileData[key] = value
        this.fileList.splice(index, 1, fileData)
      } else { // update whole data
        fileData = key
        this.fileList.splice(index, 1, fileData)
      }
    },
    showItemNotificationTemporary (name, message, time = 2000) {
      this.updateFileData(name, 'notification', message)
      setTimeout(() => {
        this.updateFileData(name, 'notification', '')
      }, time)
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
  padding-left: 7px;

  &.root {
     margin: 0px;
    padding-left: 0px;
  }
}

.context-menu {
  user-select: none;
  li {
    padding: 2px 0px 2px 10px;
    cursor: default;
    min-width: 200px;

    &:hover {
      background-color: rgb(210, 210, 210);
    }
  }
}
</style>
