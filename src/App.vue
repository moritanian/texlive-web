<template>
  <div id="app">
    <div class="header">Texlive Web</div>
    <git-hub-ribbon href="https://github.com/moritanian/texlive-web"/>
    <!--<router-view class="content"></router-view>-->
    <edit-page />
    <div class="footer"></div>
  </div>
</template>

<script>
import EditPage from './components/EditPage.vue'
import GitHubRibbon from './components/GitHubRibbon.vue'
export default {
  name: 'App',
  components: {EditPage, GitHubRibbon},
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

html, body {
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
}

.header {
  background-color: #d075af;
  color: white;
  font-size: 16px;
  font-weight: bold;
  font-family: serif;
  box-shadow: #adadad 0px 1px 4px;
  height: 32px;
  line-height: 32px;
}

</style>
