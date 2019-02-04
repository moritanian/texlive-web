<template>
  <div class="pdf-viewer" v-on:scroll="onScroll" ref="pdfViewer">
    <div class="pdf-container" ref="pdfContainer">
     <pdf-page v-for="(page, key, index) in pdfPages" :key="index" :pdfPage="page">
     </pdf-page>
    </div>
  </div>
</template>
<script>
import pdfjsLib from 'pdfjs-dist/webpack'
import {PDFVIEWER_LOAD_START_MUTATION, PDFVIEWER_LOADED_MUTATION, PDF_CHANGED_CURRENT_PAGE_MUTATION} from '../store/modules/edit_page'
import PdfPage from '../components/PdfPage.vue'

export default {
  name: 'PdfViewer',
  props: ['currentPageInput', 'pdfDataURI'],
  components: {PdfPage},
  data () {
    return {
      ctx: null,
      viewport: null,
      pdfPages: [],
      totalPageCount: 0
    }
  },
  computed: {
  },
  watch: {
    pdfDataURI: {
      handler (val, old) {
        this.loadPdf()
      }
    },
    currentPageInput: {
      handler (newPage, oldPage) {
        if (newPage < 1) {
          newPage = 1
        } else if (newPage > this.totalPageCount) {
          newPage = this.totalPageCount
        }
        this.scroll(newPage)
      }
    }
  },
  methods: {
    onScroll (e) {
      this.$store.commit(PDF_CHANGED_CURRENT_PAGE_MUTATION, this.computeCurrentPage())
    },
    scroll (page) {
      var position = (page - 1) * this.$refs.pdfViewer.scrollHeight / this.totalPageCount
      this.$refs.pdfViewer.scrollTop = position
      this.$store.commit(PDF_CHANGED_CURRENT_PAGE_MUTATION, this.computeCurrentPage())
    },
    computeCurrentPage () {
      var position = this.$refs.pdfViewer.scrollTop / this.$refs.pdfViewer.scrollHeight * this.totalPageCount
      return Math.floor(position + 1.5)
    },
    loadPdf () {
      this.$store.commit(PDFVIEWER_LOAD_START_MUTATION)

      const pdfPath = this.convertDataURIToBinary(this.pdfDataURI)
      var loadingTask = pdfjsLib.getDocument(pdfPath)

      loadingTask.promise.then((pdfDocument) => {
        this.totalPageCount = pdfDocument.numPages
        const pagePromises = Array.from(Array(this.totalPageCount).keys())
          .map(i => pdfDocument.getPage(i + 1))

        return Promise.all(pagePromises)
      }).then((pdfPages) => {
        // Display page on the existing canvas with 100% scale.
        this.pdfPages = pdfPages
      }).then((e) => {
        this.$store.commit(PDFVIEWER_LOADED_MUTATION, this.totalPageCount)
      }).catch(function (reason) {
        console.error('Error: ' + reason)
      })
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
  top: 10px;
  position: relative;
}

#canvas {
  box-shadow: rgb(117, 116, 116) 0px 0px 10px;
  margin: 20px;
}
</style>
