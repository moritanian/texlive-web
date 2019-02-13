export default {
  props: {
    env: {
      type: Object,
      required: true
    },
  },
  data () {
    return {
      fs: null,
      path: null
    }
  },
  created () {
    this.initOperations()
  },
  methods: {
    initOperations () {
      if (!this.env || !this.env.require) {
        return
      }
      this.fs = this.env.require('fs')
      this.path = this.env.require('path')
      this.update()
    },
    update () {
    }
  },
  watch: {
    env: {
      handler () {
        this.initOperations()
      }
    }
  }
}
