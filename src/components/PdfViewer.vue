<template>
  <div class="pdf-viewer" v-on:scroll="onScroll" ref="pdfViewer">
    <div class="pdf-container" ref="pdfContainer">
     <pdf-page v-for="(page, index) in pdfPages" :key="index"
      :pdfPage="pdfPageVisibility(index+1) ? page : null" :pdfScale="pdfScale" :pageNum="index+1"
      :class="{hide: !pdfPageVisibility(index+1)}" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import pdfjsLib from 'pdfjs-dist/webpack'
import {PDFVIEWER_LOAD_START_MUTATION, PDFVIEWER_LOADED_MUTATION, PDF_CHANGED_CURRENT_PAGE_MUTATION} from '../store/modules/edit_page'
import PdfPage from '../components/PdfPage.vue'

export default {
  name: 'PdfViewer',
  props: ['currentPageInput', 'pdfDataURI', 'pdfScale'],
  components: {PdfPage},
  data () {
    return {
      ctx: null,
      viewport: null,
      pdfPages: [],
      currentPage: 1,
      lowerVisibleRange: 0,
      upperVisibleRange: 0
    }
  },
  computed: {
    totalPageCount () {
      return this.pdfPages.length
    }
  },
  watch: {
    pdfDataURI: {
      handler (val, old) {
        this.loadPdf()
      }
    },
    pdfScale: {
      handler () {
        // back to the original page after resizing bacause page is changed by the resizing
        Vue.nextTick(() => {
          this.scroll(this.currentPage)
        })
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
      this.updateCurrentPage()
      this.$store.commit(PDF_CHANGED_CURRENT_PAGE_MUTATION, this.currentPage)
    },
    scroll (page) {
      var position = (page - 1) * this.$refs.pdfViewer.scrollHeight / this.totalPageCount
      this.$refs.pdfViewer.scrollTop = position
    },
    updateCurrentPage () {
      var position = this.$refs.pdfViewer.scrollTop / this.$refs.pdfViewer.scrollHeight * this.totalPageCount
      this.currentPage = Math.floor(position + 1.5)
    },
    pdfPageVisibility (page) {
      const range = this.getVisibilityPageRange()
      this.upperVisibleRange = this.currentPage + range - 2
      this.lowerVisibleRange = this.currentPage - 2
      var visibility = this.lowerVisibleRange <= page && page < this.upperVisibleRange
      return visibility
    },
    getVisibilityPageRange () {
      if (this.totalPageCount === 0 || this.pdfScale <= 0) {
        return 0
      }

      var visibleAreaHeight = this.$refs.pdfViewer.clientHeight
      var scrollHeight = this.$refs.pdfViewer.scrollHeight
      var visiblePageCount = visibleAreaHeight / scrollHeight * this.totalPageCount
      return visiblePageCount * 2 + 2
    },
    loadPdf () {
      this.$store.commit(PDFVIEWER_LOAD_START_MUTATION)

      const pdfPath = this.convertDataURIToBinary(this.pdfDataURI)
      var loadingTask = pdfjsLib.getDocument(pdfPath)

      const inflationRatio = 1
      loadingTask.promise.then((pdfDocument) => {
        const pagePromises = Array.from(Array(pdfDocument.numPages).keys())
          .map(i => pdfDocument.getPage(i + 1))

        return Promise.all(pagePromises)
      }).then((pdfPages) => {
        // Display page on the existing canvas with 100% scale.
        this.pdfPages = Array(inflationRatio).fill(pdfPages).reduce((a, b) => a.concat(b), [])
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

.hide {
  visibility: hidden
}
</style>
