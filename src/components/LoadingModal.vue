<template>
  <div class="modal">
    <img :src="require('./../assets/loading.gif')" class="loading-image">
  </div>
</template>
<script>

export default {
  name: 'LoadingModal'
}
</script>

<style scoped>
.modal {
  position: absolute;
  pointer-events: none;
  width: 100%;
  height: 100%;
  background-color: #00000038;
  z-index: 10;
}
.loading-image {
  width: 27px;
  height: 27px;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto;
  position: absolute;
}
</style>
