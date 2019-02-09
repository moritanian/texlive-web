<template>
  <div class="image-viewer">
    <div class="image-content image-background">
      <img :src="base64">
    </div>
    <div @click="onClickOpen" class="open-button">Open in new tab</div>
  </div>
</template>
<script>

export default {
  name: 'ImageViewer',
  props: {
    name: String,
    base64: String
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    onClickOpen () {
      var image = new Image()
      image.src = this.base64
      var w = window.open(this.base64)
      w.document.write(image.outerHTML)
      // window.open(this.base64, '_blank')
    }
  }
}

</script>

<style scoped lang='scss'>
.image-viewer {
  position: relative;
}

.open-button {
  height: 30px;
  width: 200px;
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  cursor: default;
  background-color: #616161;
  color: white;
  border-radius: 4px;
  text-align: center;
  line-height: 30px;
  bottom: 20px;
  box-shadow: #656565c9 0px 3px 2px 1px;
  border: solid white 2px;
}

.image-background {
  margin: 0;
  padding: 0;
  background-color: #757575;
  background-image: linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd),
  linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd);
  background-size: 18px 18px;
  background-position: 0 0, 9px 9px;
  overflow: hidden;
  height: 100%;
}

</style>
