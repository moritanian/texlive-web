<template>
  <split class="edit-content" :push-other-panes="false">
    <split-area>
      <editor editorId="editor-1" class="editor" />
    </split-area>
    <split-area class="pdf-content">
      <div class="pdf-operations">
        <button @click="onClickZoomIn" class="zoom-in-button"> + </button>
        <button @click="onClickZoomOut" class="zoom-out-button"> - </button>
        <span class='pdf-scale-text'>{{pdfScaleText}}</span>

        <input type="number" class="current-page" v-model="currentPage"/>
        <span class="total-page-count">/ {{totalPageCount}}</span>

        <button @click="onClickCompile" class="compile-button">compile</button>
        <download-pdf-button class='download-button' :base64="pdfDataURI" />
        <button @click="onToggleTexOutput" class="toggle-tex-output" :class="{on: visibleTexOutput}">tex output</button>
      </div>
      <div class="viewer-container">
        <LoadingModal v-show="loading" />
        <pdf-viewer v-show="visiblePdfViewer" />
        <tex-output v-show="visibleTexOutput" />
      </div>
    </split-area>

  </split>
</template>

<script>
import { mapState } from 'vuex'
import Editor from '../components/Editor.vue'
import PdfViewer from '../components/PdfViewer.vue'
import TexOutput from '../components/TexOutput.vue'
import DownloadPdfButton from '../components/DownloadPdfButton.vue'
import {COMPILE_ACTION, PDF_ZOOMIN_MUTATION, PDF_ZOOMOUT_MUTATION, TOGGLE_TEX_OUTPUT} from '../store/modules/edit_page'
import {Split, SplitArea} from 'vue-split-panel'
import LoadingModal from '../components/LoadingModal.vue'

export default {
  name: 'EditPage',
  components: {Editor, PdfViewer, TexOutput, DownloadPdfButton, LoadingModal, Split, SplitArea},
  computed: {
    ...mapState({
      visibleTexOutput: state => state.editPage.visibleTexOutput,
      pdfScalePercent: state => state.editPage.pdfScalePercent,
      pdfDataURI: state => state.editPage.pdfDataURI,
      loading: state => !!(state.editPage.compiling || state.editPage.pdfLoading),
      totalPageCount: state => state.editPage.pdfTotalPageCount
    }),
    pdfScaleText () {
      return `${Math.ceil(this.pdfScalePercent)}%`
    },
    visiblePdfViewer () {
      return !this.visibleTexOutput
    }
  },
  data () {
    return {
      currentPage: 1,
    }
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
    }
  }
}
</script>

<style scoped lang='css'>
.edit-content {
  width: calc(100% - 4px);
  height: calc(100% - 36px);
  margin: 2px;
}

.editor {
  min-width: 20px;
  height: 100%;
}

.pdf-content {
  height: 100%;
}

button {
  border-radius: 4px;
  outline: none;
  user-select: none;
}

.zoom-in-button, .zoom-out-button {
  width: 30px;
  height: 22px;
  font-weight: bold;
}

.compile-button, .download-button {
  width: 70px;
  height: 22px;
}

input.current-page {
  width: 20px;
  height: 22px;
  outline: none;
  user-select: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: center;
  border-radius: 2px;
}

.toggle-tex-output {
  width: 100px;
  height: 22px;
}

.toggle-tex-output.on {
  background-color: #2f7ec1;
  color: white;
}

.pdf-operations {
  background-color: rgb(222, 222, 222);
  height: 26px;
  padding-top: 2px;
}

.viewer-container {
  height: calc( 100% - 28px);
  position: relative;
}

</style>
