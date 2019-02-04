<template>
  <button class="download-button">
    <a :href="href" :download="fileName" class="link">{{text}}</a>
  </button>
</template>

<script>
import {toBlob} from './../util/util.js'
export default {
  name: 'DownloadPdfButton',
  props: {
    'text': {
      type: String,
      default: 'download'
    },
    'base64': String,
    'fileName': {
      type: String,
      default: 'original.pdf'
    }
  },
  computed: {
    href () {
      if (!this.base64) {
        return ''
      }
      // https://www.hos.co.jp/blog/20170213/
      const mimeCtype = 'application/pdf'
      var blob = toBlob(this.base64, mimeCtype)
      return window.URL.createObjectURL(blob)
    }
  },
  methods: {
  }
}
</script>

<style scoped>
.download-button {
  display: inline-block;
  background-color: white;
}
.link {
  text-decoration: none;
  text-align: center;
  border-radius: 2px;
  font-size: 12px;
  color: black;
}
</style>
