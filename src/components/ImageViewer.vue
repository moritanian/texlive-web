<template>
  <div class="image-viewer" :class="mode">
    <div class="image-content image-background">
      <img :src="base64">
    </div>
    <div v-if="visibleOpenInNewTabButton" @click="onClickOpen" class="open-button">Open in new tab</div>
    <div v-if="visibleInfo" class="info">{{infoText}}</div>
  </div>
</template>
<script>

export const ORIGINAL_SIZE_MODE = 'original-size-mode'
export const RESIZE_MODE = 'resize-mode'
export const FIXED_SIZE_MODE = 'fixed-size-mode'

export default {
  name: 'ImageViewer',
  props: {
    name: String,
    base64: String,
    visibleInfo: {
      type: Boolean,
      default: true
    },
    visibleOpenInNewTabButton: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: RESIZE_MODE
    }
  },
  data () {
    return {
      naturalWidth: 0,
      naturalHeight: 0,
    }
  },
  computed: {
    infoText () {
      return `${this.name || ''}  ${this.naturalWidth}px * ${this.naturalHeight}px`
    }
  },
  methods: {
    onClickOpen () {
      var image = new Image()
      image.src = this.base64
      var w = window.open(this.base64)
      w.document.write(image.outerHTML)
      // window.open(this.base64, '_blank')
    }
  },
  watch: {
    base64: {
      handler () {
        var image = new Image()

        image.onload = () => {
          this.naturalWidth = image.width
          this.naturalHeight = image.height
        }
        image.src = this.base64
      }
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
  bottom: 38px;
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

.original-size-mode img {

}
.resize-mode img {
  width: 100%;
}
.fixed-size-mode img {
  height: 50%;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100px;
  top: 0;
  margin: auto;
}

.original-size-mode .image-background {
  overflow: scroll;
}

.info {
  background-color: rgba(0, 0, 0, 0.76);
  width: 100%;
  position: absolute;
  bottom: 0px;
  color: white;
  padding: 5px;
}

</style>
