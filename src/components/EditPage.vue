<template>
  <split class="edit-content" :push-other-panes="false">
    <split-area :size="15" :minSize="10">
      <folder-panel></folder-panel>
    </split-area>
    <split-area :size="33" :minSize="10">
      <editor editorId="editor-1" class="editor" v-show="visibleEditor"/>
      <image-viewer :base64="imageViewerBase64" class="image-viewer" v-show="visibleImageViewer"></image-viewer>
    </split-area>
    <split-area class="pdf-content" :size="52" :minSize="10">
      <ul class="pdf-operations">
        <li class="scale-operation-group">
          <ul>
            <li @click="onClickZoomIn" class="zoom-in-button zoom-icon"><img width="20" height="20" :src="enlargeIconUrl"></li>
            <li @click="onClickZoomOut" class="zoom-out-button zoom-icon"><img width="20" height="20" :src="reduceIconUrl"></li>
            <li class='pdf-scale-text'>{{pdfScaleText}}</li>
          </ul>
        </li>
        <li class="page-operation-group">
          <ul>
            <li><input type="number" class="current-page" :value="currentPage" @input="onCurrentPageInput"/></li>
            <li><span class="total-page-count">/ {{totalPageCount}}</span></li>
          </ul>
        </li>
        <li class="button-group">
          <button @click="onClickCompile" class="compile-button">compile</button>
          <download-pdf-button class='download-button' :base64="pdfDataURI" />
          <span class="tex-output">
            <div v-show="errorCount>0" class="error-count-text">{{errorCount}}</div>
            <span @click="onToggleTexOutput" class="toggle-tex-output" :class="{on: visibleTexOutput}">
              <img width="20" height="20" :src="infoIconUrl" alt='info'>
            </span>
          </span>
        </li>
      </ul>
      <div class="viewer-container">
        <LoadingModal v-show="loading" />
        <pdf-viewer v-show="visiblePdfViewer"
          :currentPageInput="currentPageInput"
          :pdfDataURI="pdfDataURI"
          :pdfScale="pdfScale"/>
        <tex-output v-show="visibleTexOutput" />
      </div>
    </split-area>

  </split>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import FolderPanel from '../components/FolderPanel.vue'
import Editor from '../components/Editor.vue'
import ImageViewer from '../components/ImageViewer.vue'
import PdfViewer from '../components/PdfViewer.vue'
import TexOutput from '../components/TexOutput.vue'
import DownloadPdfButton from '../components/DownloadPdfButton.vue'
import {COMPILE_ACTION, PDF_ZOOMIN_MUTATION, PDF_ZOOMOUT_MUTATION, TOGGLE_TEX_OUTPUT} from '../store/modules/edit_page'
import { FILE_OPEN_ACTION } from '../store/modules/file_system'

import {Split, SplitArea} from 'vue-split-panel'
import LoadingModal from '../components/LoadingModal.vue'

export default {
  name: 'EditPage',
  components: {FolderPanel, Editor, ImageViewer, PdfViewer, TexOutput, DownloadPdfButton, LoadingModal, Split, SplitArea},
  computed: {
    ...mapState({
      visibleImageViewer: state => state.editPage.visibleImageViewer,
      imageViewerBase64: state => state.editPage.imageViewerBase64,
      visibleTexOutput: state => state.editPage.visibleTexOutput,
      pdfScalePercent: state => state.editPage.pdfScalePercent,
      pdfDataURI: state => state.editPage.pdfDataURI,
      loading: state => !!(state.editPage.compiling || state.editPage.pdfLoading),
      totalPageCount: state => state.editPage.pdfTotalPageCount,
      currentPage: state => state.editPage.pdfCurrentPage,
      env: state => state.fileSystem.env,
      targetTexFile: state => state.editPage.targetTexFile
    }),
    ...mapGetters({
      errorCount: 'pdftexOutputErrorCount',
      pdfScale: 'pdfScale'
    }),
    pdfScaleText () {
      return `${Math.ceil(this.pdfScalePercent)}%`
    },
    visiblePdfViewer () {
      return !this.visibleTexOutput
    },
    visibleEditor () {
      return !this.visibleImageViewer
    }
  },
  data () {
    return {
      currentPageInput: 1,
      enlargeIconUrl: require('./../assets/enlarge-icon.svg'),
      reduceIconUrl: require('./../assets/reduce-icon.svg'),
      infoIconUrl: require('./../assets/info-icon.svg')
    }
  },
  mounted () {
    var path = this.env.require('path')
    var parsed = path.parse(this.targetTexFile)
    this.$store.dispatch(
      FILE_OPEN_ACTION, {name: parsed.name, directoryFullPath: parsed.dir, env: this.env}
    ).then(() => {
      this.$store.dispatch(COMPILE_ACTION)
    })
  },
  methods: {
    onClickZoomIn () {
      this.$store.commit(PDF_ZOOMIN_MUTATION)
    },
    onClickZoomOut () {
      this.$store.commit(PDF_ZOOMOUT_MUTATION)
    },
    onClickCompile () {
      this.$store.dispatch(COMPILE_ACTION)
    },
    onClickDownload () {
    },
    onToggleTexOutput () {
      this.$store.commit(TOGGLE_TEX_OUTPUT)
    },
    onCurrentPageInput (e) {
      var value = parseInt(e.target.value)
      if (!isNaN(value)) {
        this.currentPageInput = value
      }
    }
  }
}
</script>

<style scoped lang='scss'>

$op-height: 24px;

.edit-content {
  width: calc(100% - 4px);
  height: calc(100% - 36px);
  margin: 2px;
}

.editor {
  min-width: 20px;
  height: 100%;
}

.image-viewer {
  width: 100%;
  height: 100%;
}

.pdf-content {
  height: 100%;
}

ul {
  list-style-type: none;
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-block;
}

li {
  display: inline-block;
  vertical-align: top;
}

ul.pdf-operations {
  background-color: rgb(222, 222, 222);
  height: $op-height;
  padding: 2px 0px;
  width: 100%;

  .scale-operation-group {
    margin: 0;

    .pdf-scale-text {
      width: 30px;
    }
  }

  .page-operation-group {
    margin-left: 10px;

    .total-page-count {
      height: $op-height;
      line-height: $op-height;
    }
  }

  .button-group {
    margin: 0 60px 0 20px;

    button {
      border-radius: 4px;
      outline: none;
      user-select: none;
    }

    .compile-button, .download-button {
      height: $op-height;
      display: inline-block;
      vertical-align: top;
    }

    .compile-button {
      width: 80px;
      font-family: serif;
      font-size: 13px;
      text-align: center;
      font-weight: bold;
      line-height: 13px;
    }

    .download-button {
      width: 50px;
    }

    .tex-output {
      position: relative;
      vertical-align: top;

      .error-count-text{
        background-color: #c71414;
        color: white;
        width: 20px;
        height: 18px;
        position: absolute;
        left: -4px;
        top: -2px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 18px;
        box-shadow: #888888 1px 1px 1px;
        pointer-events: none;
        user-select: none;
      }

      .toggle-tex-output {
        width: 40px;
        display: inline-block;
        height: $op-height;
      }

      .toggle-tex-output.on {
        background-color: #65b8ff;
        color: white;
        border-radius: 3px;
        box-shadow: #b1b1b196 0px 0px 4px 1px;
      }
    }

  }
}

.zoom-icon {
  width: 30px;
  height: $op-height;
  font-weight: bold;

  &.zoom-in-button {
  }

  img {
    width: 24px;
    height: $op-height;
  }
}

input.current-page {
  width: 28px;
  height: $op-height;
  outline: none;
  user-select: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: center;
  border-radius: 2px;
  font-size: 14px;
  line-height: $op-height;
}

.viewer-container {
  height: calc( 100% - 28px);
  position: relative;
}

</style>
