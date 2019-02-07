<template>
  <canvas
    id='canvas'
    ref='canvas'
    :width="pdfWidth" :height="pdfHeight"
    v-bind:style="{ width:pdfPixelWidth + 'px', height:pdfPixelHeight + 'px'}">></canvas>
</template>
<script>
const SCALE_CORRECTION_RATIO = 8 / 3 // why 8 / 3 ??
export default {
  name: 'PdfPage',
  props: {
    pdfPage: Object,
    pdfScale: Number,
    pageNum: Number
  },
  data () {
    return {
      ctx: null,
      viewport: null,
      previousPdfPage: null,
      needRender: false
    }
  },
  computed: {
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
    this.renderPdf()
  },
  watch: {
    pdfScale: {
      handler (newScale, oldScale) {
        this.needRender = true

        // only update scale if no pdfPage
        if (!this.pdfPage) {
          this.viewport = this.previousPdfPage.getViewport(this.pdfScale * SCALE_CORRECTION_RATIO)
          return
        }

        this.renderPdf()
      }
    },
    pdfPage: {
      handler () {
        this.renderPdf()
      }
    }
  },
  methods: {
    renderPdf () {
      if (!this.pdfPage) {
        return
      }
      // Do not render if already rendered
      if (!this.needRender && this.previousPdfPage === this.pdfPage) {
        return
      }
      this.needRender = false
      this.previousPdfPage = this.pdfPage
      this.viewport = this.pdfPage.getViewport(this.pdfScale * SCALE_CORRECTION_RATIO)
      var renderTask = this.pdfPage.render({
        canvasContext: this.ctx,
        viewport: this.viewport,
      })
      return renderTask.promise
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
  margin: 10px 20px;
}
</style>
