<template>
  <div class="upload-panel">
    <div class="drop" :class="{dragging:dragging}"
      @dragleave.prevent="onDragLeave" @dragover.prevent @drop.prevent="onDrop"
      @dragover.exact="onDragOver">
      <slot></slot>
      <linear-progress-bar
        v-show="uploading"
        :percentage="loadingPercentage"
        @endAnimation="onEndAnimation"></linear-progress-bar>
    </div>
  </div>
</template>
<script>
import {bufferToBase64, utf8ToBase64, isImageFile, loadCORSImageURI} from './../util/util'
import LinearProgressBar from '../components/LinearProgressBar'
import FileOperationable from '../mixins/FileOperationable'
const util = require('util')

export default {
  name: 'UploadPanel',
  mixins: [FileOperationable],
  components: {LinearProgressBar},
  props: {
    env: {
      type: Object,
      required: true
    },
    fullPath: {
      type: String,
      default: '/'
    },
  },
  data () {
    return {
      dragging: false,
      uploading: false,
      waitingUploadAnimation: false,
      loadingPercentage: 0
    }
  },
  computed: {
  },
  methods: {
    onDrop (e) {
      e.preventDefault()
      e.stopPropagation()
      this.uploading = true
      this.loadingPercentage = 10
      this.dragging = false

      var i
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        for (i = 0; i < e.dataTransfer.items.length; i++) {
          this.handleDataTransferItem(e.dataTransfer.items[i])
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Use DataTransfer interface to access the file(s)
        for (i = 0; i < e.dataTransfer.files.length; i++) {
          var file = e.dataTransfer.files[i]
          this.loadFile(file)
        }
      } else {
        this.uploading = false
      }
    },
    handleDataTransferItem (item) {
      var file
      let kind = item.kind
      let type = item.type
      console.log(kind, type)
      let entryItem = item.webkitGetAsEntry()

      if (entryItem) {
        this.traverseFileTree(entryItem)
        return
      }

      if (item === 'file') { // file
        file = item.getAsFile()
        this.loadFile(file)
      } else if (kind === 'string') { // string
        var result = item.getAsString((url) => {
          console.log(url)
          if (type === 'text/uri-list') { // url string
            var fileName = this.path.parse(url).base.replace(/\?.*$/, '')
            loadCORSImageURI(url, true).then((base64) => {
              this.writeFile('', new File([base64], fileName), base64, 'base64')
            }).catch((err) => {
              this.uploading = false
              console.log(err)
            })
          } else if (type === 'text/plain') {
            this.removeFile(url)
          } else {
            console.warn(`Cannot handle type [${type}]`)
          }
        })
        console.log(result)
      }
    },
    traverseFileTree (item, path = '') {
      if (item.isFile) {
        // Get file
        item.file((file) => {
          this.loadFile(file, path)
        })
      } else if (item.isDirectory) {
        this.fs.mkdir(this.path.join(this.fullPath, path, item.name), (err) => {
          console.log(err)
        })

        // Get folder contents
        var dirReader = item.createReader()
        dirReader.readEntries((entries) => {
          for (var i = 0; i < entries.length; i++) {
            this.traverseFileTree(entries[i], path + item.name + '/')
          }
        })
      }
    },
    loadFile (file, path = '') {
      console.log('loadfile', file.name, this.fullPath)
      var self = this
      // directoryFullPath: this.fullPath, file: file
      importFile(file).then((result) => {
        if (isImageFile(file.name)) {
          this.writeFile(path, file, result.replace(/^data:image\/.*;base64,/, ''), 'base64')
        } else {
          this.writeFile(path, file, result)
        }
      })

      function importFile (file) {
        if (isImageFile(file.name)) {
          return importImageFile(file)
        } else {
          return importTextFile(file)
        }
      }

      function importImageFile (file) {
        var reader = new FileReader()
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            resolve(e.target.result)
          }
          reader.onprogress = onprogress
          reader.onerror = onerror
          reader.readAsDataURL(file)
        })
      }

      function importTextFile (file) {
        var reader = new FileReader()
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            resolve(e.target.result)
          }
          reader.onprogress = onprogress
          reader.onerror = onerror
          reader.readAsText(file)
        })
      }

      function onprogress (e) {
        self.loadingPercentage = e.loaded / e.total * 100
      }

      function onerror (e) {
        console.log(e)
        this.uploading = false
      }
    },
    writeFile (path, file, data, type = undefined) {
      this.fs.writeFile(this.path.join(this.fullPath, path, file.name), data, type, (err) => {
        if (err) {
          console.log(err)
          this.uploading = false
          return
        }

        this.waitingUploadAnimation = true
        // this.$emit('uploaded', file)
      })
    },
    removeFile (oldPath) {
      this.uploading = false
      this.fs.rename(oldPath, this.path.join(this.fullPath, this.path.parse(oldPath).base), (err) => {
        if (err) {
          console.log(err)
          return err
        }
        this.$emit('uploaded')
      })
    },
    onEndAnimation (e) {
      if (this.waitingUploadAnimation) {
        this.uploading = false
        this.$emit('uploaded')
      }
    },
    onDragOver (e) {
      e.stopPropagation()
      this.dragging = true
    },
    onDragLeave (e) {
      this.dragging = false
    }
  }
}

</script>

<style scoped lang="scss">
.upload-panel {
  width: 100%;
  height: 100%;
}

.drop {
  width: 100%;
  height: 100%;

  &.dragging {
    cursor: crosshair;
    background-color: rgb(216, 199, 199) ;
  }
}
</style>
