<template>
  <div class="folder-panel">
    <span @click="onClickUpload" class="upload-button">
      <img width="30" height="30" :src="uploadIconUrl" alt="upload">
    </span>
    <transition name="fade">
      <upload-modal id="upload-modal" :env="env" :fullPath="basePath" v-show="visibleUploadModal"></upload-modal>
    </transition>
    <div class="dirs-area">
      <upload-panel :env="env" :fullPath="basePath" class="root-upload-panel" @uploaded="uploadedInRootPanel">
        <directory-tree
          ref="rootTree"
          :isRoot="false"
          :env="env"
          :fullPath="basePath"
          :selectedItemName="selectedItemName"
          @open="onOpenFolder"
          :directoryTreeInfo="directoryTreeInfo"
          :excludes="[/^\.hoge/, /\.config$/, /.*__MACOSX/]"></directory-tree>
      </upload-panel>
    </div>
  </div>
</template>
<script>
import UploadModal from '../components/UploadModal.vue'
import UploadPanel from '../components/UploadPanel.vue'
import DirectoryTree from '../components/DirectoryTree.vue'
import { mapState } from 'vuex'
import { UPLOAD_MODAL_OPEN_BUTTON_CLICKED } from '../store/modules/file_system'

export default {
  name: 'FolderPanel',
  components: {UploadModal, UploadPanel, DirectoryTree},
  data () {
    return {
      uploadIconUrl: require('./../assets/upload-icon.svg'),
      directoryTreeInfo: {}
    }
  },
  computed: {
    ...mapState({
      visibleUploadModal: state => state.fileSystem.visibleUploadModal,
      env: state => state.fileSystem.env,
      selectedItemName: state => state.editPage.selectedItemName,
      basePath: state => state.editPage.workspacePath
    }),
    directoryTreeInfoPath () {
      return this.basePath + '.workspace.config.json'
    }
  },
  methods: {
    onClickUpload (e) {
      this.$store.commit(UPLOAD_MODAL_OPEN_BUTTON_CLICKED)
    },
    uploadedInRootPanel () {
      this.$refs.rootTree.update(true)
    },
    onOpenFolder (fullPath, isOpen) {
      if (!this.directoryTreeInfo[fullPath]) {
        this.directoryTreeInfo[fullPath] = {}
      }
      this.directoryTreeInfo[fullPath].open = isOpen
      this.fs.writeFile(
        this.directoryTreeInfoPath,
        JSON.stringify(this.directoryTreeInfo, null, ' '),
        (err) => {
          if (err) {
            console.log(err)
          }
        }
      )
    },
    initOperations () {
      if (!this.env || !this.env.require) {
        return
      }
      this.fs = this.env.require('fs')
      this.path = this.env.require('path')
      this.fs.readFile(this.directoryTreeInfoPath, (err, content) => {
        if (err) {
          console.log(err)
          return
        }

        try {
          this.directoryTreeInfo = JSON.parse(content.toString())
        } catch (err) {
          console.log(err)
          return err
        }
      })
    },
  },
  watch: {
    env: {
      handler () {
        this.initOperations()
      }
    }
  }
}

</script>

<style scoped lang='scss'>
.folder-panel {
  height: 100%;

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
    font-family: serif;
    height: calc(100% - 45px);

    .root-upload-panel {
      height: 100%;
    }
  }
}

.fade-enter-active {
    transition: opacity 500ms ease-out;
}
.fade-eave-active {
    transition: opacity 1000ms ease-in;
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
