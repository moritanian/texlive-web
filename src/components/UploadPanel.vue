<template>
  <div class="upload-panel">
    <div class="drop" @dragleave.prevent @dragover.prevent @drop.prevent="onDrop">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import { FILE_UPLOADED_ACTION } from '../store/modules/file_system'

export default {
  name: 'UploadPanel',
  props: {
    fullPath: {
      type: String,
      default: '/'
    },
    onUpload: Function
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    onDrop (e) {
      e.preventDefault()
      var i, file
      if (e.dataTransfer.items) {
        for (i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            file = e.dataTransfer.items[i].getAsFile()
            this.importFile(file)
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (i = 0; i < e.dataTransfer.files.length; i++) {
          file = e.dataTransfer.files[i]
          this.importFile(file)
        }
      }
    },
    importFile (file) {
      this.$store.dispatch(FILE_UPLOADED_ACTION, {
        directoryFullPath: this.fullPath, file: file
      }).then((e) => {
        this.onUpload(e)
      })
    }
  },
  onUpload (e) {
    // this.$store.dispatch(FILE_UPLOADED_ACTION, {
  }
}

</script>

<style scoped>
.upload-panel {
  width: 100%;
  height: 100%;
}

.drop {
  width: 100%;
  height: 100%;
}
</style>
