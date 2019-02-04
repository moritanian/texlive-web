<template>
  <div class="pdf-viewer">
    <div class="pdf-container">
      <canvas
        id='canvas'
        ref='canvas'
        :width="pdfWidth" :height="pdfHeight"
        v-bind:style="{ width:pdfPixelWidth + 'px', height:pdfPixelHeight + 'px'}">></canvas>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import pdfjsLib from 'pdfjs-dist/webpack'
import {PDFVIEWER_LOAD_START_MUTATION, PDFVIEWER_LOADED_MUTATION} from '../store/modules/edit_page'

export default {
  name: 'PdfViewer',
  data () {
    return {
      ctx: null,
      pdfPage: null,
      viewport: null
    }
  },
  computed: {
    ...mapState({
      pdfDataURI: state => state.editPage.pdfDataURI,
    }),
    ...mapGetters(['pdfScale']),
    actualSizeViewport () {
      return this.viewport || {width: 0, height: 0}
    },
    pdfWidth () {
      return this.actualSizeViewport.width
    },
    pdfHeight () {
      return this.actualSizeViewport.height
    },
    pdfPixelWidth () {
      return this.pdfWidth / window.devicePixelRatio
    },
    pdfPixelHeight () {
      return this.pdfHeight / window.devicePixelRatio
    }
  },
  mounted () {
    this.ctx = this.$refs.canvas.getContext('2d')
  },
  watch: {
    pdfDataURI: {
      handler (val, old) {
        this.loadPdf()
      }
    },
    pdfScale: {
      handler () {
        this.renderPdf()
      }
    }
  },
  methods: {
    loadPdf () {
      this.$store.commit(PDFVIEWER_LOAD_START_MUTATION)

      const pdfPath = this.convertDataURIToBinary(this.pdfDataURI)
      var loadingTask = pdfjsLib.getDocument(pdfPath)

      var currentPdfDoc = null

      loadingTask.promise.then((pdfDocument) => {
        // Request a first page
        currentPdfDoc = pdfDocument
        console.log(pdfDocument)
        return pdfDocument.getPage(1)
      }).then((pdfPage) => {
        // Display page on the existing canvas with 100% scale.
        this.pdfPage = pdfPage
        return this.renderPdf()
      }).then((e) => {
        this.$store.commit(PDFVIEWER_LOADED_MUTATION, currentPdfDoc)
      }).catch(function (reason) {
        console.error('Error: ' + reason)
      })
    },
    renderPdf () {
      this.viewport = this.pdfPage.getViewport(this.pdfScale * 8 / 3) // why need 8/3?
      var renderTask = this.pdfPage.render({
        canvasContext: this.ctx,
        viewport: this.viewport,
      })
      return renderTask.promise
    },
    convertDataURIToBinary (dataURI) {
      var BASE64_MARKER = ';base64,'
      var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
      var base64 = dataURI.substring(base64Index)
      var raw = window.atob(base64)
      var rawLength = raw.length
      var array = new Uint8Array(new ArrayBuffer(rawLength))

      for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i)
      }
      return array
    }
  }
}

</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  overflow: scroll;
  background-color: #a0a0a0;
  position: relative;
}
.pdf-container {
  top: 50px;
  position: relative;
}

#canvas {
  box-shadow: rgb(117, 116, 116) 0px 0px 10px;
  margin: 20px;
}
</style>
