<template>
  <div class="folder-panel">
    <span @click="onClickUpload" class="upload-button">
      <img width="30" height="30" :src="uploadIconUrl" alt="upload">
    </span>
    <transition name="fade">
      <upload-modal id="upload-modal" v-show="visibleUploadModal"></upload-modal>
    </transition>
    <div class="dirs-area">
      <directory-tree :env="env" fullPath="/" :selectedItemName="selectedItemName"></directory-tree>
    </div>
  </div>
</template>
<script>
import UploadModal from '../components/UploadModal.vue'
import DirectoryTree from '../components/DirectoryTree.vue'
import { mapState } from 'vuex'
import { UPLOAD_MODAL_OPEN_BUTTON_CLICKED } from '../store/modules/file_system'

export default {
  name: 'FolderPanel',
  components: {UploadModal, DirectoryTree},
  data () {
    return {
      uploadIconUrl: require('./../assets/upload-icon.svg')
    }
  },
  computed: {
    ...mapState({
      visibleUploadModal: state => state.fileSystem.visibleUploadModal,
      env: state => state.fileSystem.env,
      selectedItemName: state => state.editPage.selectedItemName
    })
  },
  methods: {
    onClickUpload (e) {
      this.$store.commit(UPLOAD_MODAL_OPEN_BUTTON_CLICKED)
    }
  }
}

</script>

<style scoped>
#upload-modal {
  position: absolute;
  width: 80%;
  height: 80%;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

.upload-button {
  display: inline-block;
}

.dirs-area {
  border-top: solid 1px #6b6b6b;
  margin-top: 2px;
  padding-top: 5px;
}

.fade-enter-active {
    transition: opacity 1000ms ease-out;
}
.fade-eave-active {
    transition: opacity 100ms ease-in;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-to,
.fade-leave {
    opacity: 1;
}
</style>
