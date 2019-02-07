<template>
  <span class="download-button">
    <a :href="href" :download="fileName" class="link">
      <img width="20" height="20" :src="downloadIconUrl" alt="downlaod">
    </a>
  </span>
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
  data () {
    return {
      downloadIconUrl: require('./../assets/download-icon.svg')
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
}
.link {
  text-decoration: none;
  text-align: center;
  display: inline-block;
  border-radius: 2px;
  font-size: 12px;
  color: black;
}
</style>
