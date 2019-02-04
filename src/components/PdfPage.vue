<template>
  <canvas
    id='canvas'
    ref='canvas'
    :width="pdfWidth" :height="pdfHeight"
    v-bind:style="{ width:pdfPixelWidth + 'px', height:pdfPixelHeight + 'px'}">></canvas>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PdfPage',
  props: ['pdfPage'],
  data () {
    return {
      ctx: null,
      viewport: null
    }
  },
  computed: {
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
    this.renderPdf()
  },
  watch: {
    pdfScale: {
      handler () {
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
      this.viewport = this.pdfPage.getViewport(this.pdfScale * 8 / 3) // why need 8/3?
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
