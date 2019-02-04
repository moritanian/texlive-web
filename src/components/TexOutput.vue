<template>
  <div  class="tex-output" :scrollTop="scrollHeight"
    ref='texOutputElem'>
    <p v-for="(item, key, index) in outputList" :key="index"
      class="output-text" :class="item.type">
      {{item.output}}
    </p>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Vue from 'vue'

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
  }
}
</script>

<style scoped>
.tex-output {
  height: 100%;
  overflow: scroll;
}

.output-text {
  text-align: left;
  margin: 0;
  font-size: 12px;
}
.info {
  color: black
}

.error {
  color: red;
}
</style>
