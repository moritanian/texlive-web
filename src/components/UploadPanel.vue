<template>
  <div class="upload-panel">
    <div class="drop" :class="{dragging:dragging}"
      @dragleave.prevent="onDragLeave" @dragover.prevent @drop.prevent="onDrop"
      @dragover.exact="onDragOver">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import {bufferToBase64, utf8ToBase64, isImageFile, loadCORSImageURI} from './../util/util'
import axios from 'axios'
const util = require('util')

export default {
  name: 'UploadPanel',
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
    }
  },
  computed: {
  },
  mounted () {
    this.fs = this.env.require('fs')
    this.path = this.env.require('path')
  },
  methods: {
    onDrop (e) {
      e.preventDefault()
      e.stopPropagation()
      this.dragging = false

      var i, file
      if (e.dataTransfer.items) {
        for (i = 0; i < e.dataTransfer.items.length; i++) {
          let item = e.dataTransfer.items[i]
          let kind = item.kind
          let type = item.type
          console.log(kind, type)
          let entryItem = e.dataTransfer.items[i].webkitGetAsEntry()

          if (entryItem) {
            this.traverseFileTree(entryItem)
            return
          }

          // If dropped items aren't files, reject them
          if (item === 'file') {
            file = item.getAsFile()
            this.loadFile(file)
          } else if (kind === 'string') {
            var result = e.dataTransfer.items[i].getAsString((url) => {
              console.log(url)
              if (type === 'text/uri-list') {
                var fileName = this.path.parse(url).base.replace(/\?.*$/, '')
                loadCORSImageURI(url, true).then((base64) => {
                  this.fs.writeFile(this.path.join(this.fullPath, fileName), base64, 'base64', (err) => {
                    if (err) {
                      console.log(err)
                      return
                    }

                    this.$emit('uploaded', file)
                  })
                }).catch((err) => {
                  console.log(err)
                })
              }
            })
            console.log(result)
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (i = 0; i < e.dataTransfer.files.length; i++) {
          file = e.dataTransfer.files[i]
          this.loadFile(file)
        }
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
    onDragOver (e) {
      e.stopPropagation()
      this.dragging = true
    },
    onDragLeave (e) {
      this.dragging = false
    },
    loadFile (file, path = '') {
      // directoryFullPath: this.fullPath, file: file
      importFile(file).then((result) => {
        if (isImageFile(file.name)) {
          this.fs.writeFile(this.path.join(this.fullPath, path, file.name), result.replace(/^data:image\/.*;base64,/, ''), 'base64', (err) => {
            if (err) {
              console.log(err)
              return
            }

            this.$emit('uploaded', file)
          })
        } else {
          this.fs.writeFile(this.path.join(this.fullPath, path, file.name), result, (err) => {
            if (err) {
              console.log(err)
              return
            }

            this.$emit('uploaded', file)
          })
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
          reader.readAsDataURL(file)
        })
      }

      function importTextFile (file) {
        var reader = new FileReader()
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            resolve(e.target.result)
          }
          reader.readAsText(file)
        })
      }
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
