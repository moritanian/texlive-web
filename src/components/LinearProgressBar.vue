<template>
  <div class="linear-progress-bar">
    <div class="progressed-area" :style="`width: ${showPercentage}%`">
      <div class="animation-area"></div>
    </div>
    <div class="percentage-text" v-if="showText">{{showPercentage}}%</div>
  </div>
</template>

<script>
export default {
  name: 'LinearProgressBar',
  props: {
    percentage: Number,
    showText: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showPercentage: 0
    }
  },
  mounted () {
    this.startAnimate()
  },
  methods: {
    animate () {
      const maxSpeed = 3
      var diff = this.percentage - this.showPercentage
      if (diff < 0) {
        this.showPercentage = this.percentage
        return
      }

      var add = maxSpeed
      if (diff < maxSpeed) {
        add = diff
      }
      this.showPercentage += add
      if (this.showPercentage >= this.percentage) {
        this.$emit('endAnimation')
        return
      }

      this.animationHandler = requestAnimationFrame(this.animate)
    },
    startAnimate () {
      this.animate = this.animate.bind(this)

      if (this.animationHandler) {
        cancelAnimationFrame(this.animationHandler)
      }
      requestAnimationFrame(this.animate)
    }
  },
  watch: {
    percentage: {
      handler () {
        this.startAnimate()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.linear-progress-bar {
  width: 100%;
  height: 20px;
  position: relative;

  .progressed-area {
    width: 50%;
    height: 100%;
    overflow: hidden;

    .animation-area {
      width: calc(100% + 28px);
      height: 100%;
      display: block;
      background-color: #ECECEC;
      background-image: -webkit-gradient(linear, 0 0, 100% 100%,color-stop(.25, #F9F9F9), color-stop(.25, transparent),color-stop(.5, transparent), color-stop(.5, #F9F9F9),color-stop(.75, #F9F9F9), color-stop(.75, transparent),to(transparent));
      background-size: 28px 28px;
      animation-duration: 0.5s;
      animation-name: linear-movement;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
  }

  @keyframes linear-movement {
    from {
      transform: translateX(-28px);
    }
    to {
      transform: translateX(0);
    }
  }

  .percentage-text {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    margin: auto;
    color: #4c4c4c;
  }
}
</style>
