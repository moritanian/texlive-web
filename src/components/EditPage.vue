<template>
  <div class="edit-content">
    <Editor editorId="editor-1" class="editor" />
    <div class="pdf-content">
      <div class="pdf-operations">
        <button @click="onClickZoomIn" class="zoom-in-button"> + </button>
        <button @click="onClickZoomOut" class="zoom-out-button"> - </button>
        <span class='pdf-scale-text'>{{pdfScaleText}}</span>
        <button @click="onClickCompile" class="compile-button">compile</button>
        <DownloadPdfButton class='download-button' :base64="pdfDataURI" />
        <button @click="onToggleTexOutput" class="toggle-tex-output" :class="{on: visibleTexOutput}">tex output</button>
      </div>
      <div class="viewer-container">
        <PdfViewer v-show="visiblePdfViewer" />
        <TexOutput v-show="visibleTexOutput" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Editor from '../components/Editor.vue'
import PdfViewer from '../components/PdfViewer.vue'
import TexOutput from '../components/TexOutput.vue'
import DownloadPdfButton from '../components/DownloadPdfButton.vue'
import {COMPILE_ACTION, PDF_ZOOMIN_MUTATION, PDF_ZOOMOUT_MUTATION, TOGGLE_TEX_OUTPUT} from '../store/modules/edit_page'
export default {
  name: 'EditPage',
  components: {Editor, PdfViewer, TexOutput, DownloadPdfButton},
  computed: {
    ...mapState({
      visibleTexOutput: state => state.editPage.visibleTexOutput,
      pdfScalePercent: state => state.editPage.pdfScalePercent,
      pdfDataURI: state => state.editPage.pdfDataURI
    }),
    pdfScaleText () {
      return `${Math.ceil(this.pdfScalePercent)}%`
    },
    visiblePdfViewer () {
      return !this.visibleTexOutput
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

<style scoped>
  .edit-content {
    width: calc(100% - 4px);
    height: calc(100% - 36px);
    margin: 2px;
  }

  .editor {
    float: left;
    width: calc(50% - 5px);
    height: 100%;
  }

  .pdf-content {
    float: right;
    width: 50%;
    height: 100%;
  }

  button {
    border-radius: 4px;
    outline: none;
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
  }

</style>
