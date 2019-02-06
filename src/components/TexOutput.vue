<template>
  <div  class="tex-output"
    ref='texOutputElem'>
    <p v-for="(item, key, index) in outputList" :key="index"
      class="output-text" :class="outputTextClass(item)">
      {{item.output}}
    </p>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Vue from 'vue'
import {PDFTEX_OUTPUT_TYPES} from './../store/modules/edit_page.js'

const classTable = {
  [PDFTEX_OUTPUT_TYPES.INFO]: 'info',
  [PDFTEX_OUTPUT_TYPES.ERROR]: 'error'
}

export default {
  name: 'TexOutput',
  computed: {
    ...mapState({
      outputList: state => state.editPage.pdftexOutputList,
    })
  },
  watch: {
    outputList: function () {
      Vue.nextTick(() => {
        this.$refs.texOutputElem.scrollTop = this.$refs.texOutputElem.scrollHeight
      })
    }
  },
  methods: {
    outputTextClass: (item) => {
      return classTable[item.type]
    }
  }
}
</script>

<style scoped>
.tex-output {
  height: 100%;
  overflow: scroll;
  background-color: rgb(202, 202, 202);
}

.output-text {
  text-align: left;
  margin: 0;
  font-size: 12px;
  margin: 4px;
  padding: 6px;
  border-radius: 3px;
  color: white;
}
.info {
  background-color: #e8e8e8;
  color: black;
}

.error {
  color: white;
  background-color: #c30000;
}
</style>
