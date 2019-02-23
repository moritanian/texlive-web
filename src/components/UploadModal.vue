<template>
  <div class="upload-modal">
    <div class="close-button" @click="onClickClose">
      <img width="30" height="30" :src="closeIconUrl" alt="upload">
    </div>
    <upload-panel :env="env" :full-path="fullPath" @uploaded="onUpload" ref="uploadPanel">
      <input @change="onInputFile" type="file" name="file">
      <div class="drop-area">
        Drop here!!
      </div>
    </upload-panel>
  </div>
</template>
<script>
import UploadPanel from '../components/UploadPanel.vue'
import { UPLOAD_MODAL_CLOSE_BUTTON_CLICKED } from '../store/modules/file_system'

export default {
  name: 'UploadModal',
  components: {UploadPanel},
  props: {
    env: {
      type: Object,
      required: true
    },
    fullPath: {
      type: String,
      default: '/'
    }
  },
  data () {
    return {
      closeIconUrl: require('./../assets/close-icon.svg')
    }
  },
  computed: {
  },
  methods: {
    onInputFile (e) {
      e.preventDefault()
      var files = e.target.files
      var tasks = []
      for (var i = 0; i < files.length; i++) {
        this.$refs.uploadPanel.loadFile(files[i])
        // tasks.push(this.$store.dispatch(FILE_UPLOADED_ACTION, {directory: '/', file: files[i]}))
      }
      Promise.all(tasks).then(e => {
        this.onUpload()
      })
    },
    onClickClose (e) {
      this.$store.commit(UPLOAD_MODAL_CLOSE_BUTTON_CLICKED)
    },
    onUpload (e) {
      console.log(e)
      this.$store.commit(UPLOAD_MODAL_CLOSE_BUTTON_CLICKED)
    }
  }
}

</script>

<style scoped lang='scss'>
.upload-modal {
  z-index: 100;
  border-radius: 5px;
  background-color: rgb(234, 234, 234);
  box-shadow: #8a8a8a3b 1px 0px 6px 0px;
  padding: 20px;

  .drop-area {
    border: 1.2px dashed #b50;
    border-radius: 6px;
    vertical-align: middle;
    height: calc(100% - 70px);
    padding: 20px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
  }

  .close-button {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 10px;
    top: 10px;
    &:hover {
      opacity: 0.7;
    }
    &:active {
      opacity: 1.0;
    }
  }
}
</style>
