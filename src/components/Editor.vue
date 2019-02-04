<template>
  <div :id="editorId" class="editor"></div>
</template>
<script>
import { mapState } from 'vuex'
import {
  CONTENT_CHANGED_MUTATION, CONTENT_SAVE_ACTION,
  CONTENT_LOAD_ACTION, COMPILE_ACTION
} from '../store/modules/edit_page'
import * as ace from 'brace'
import 'brace/mode/javascript'
import 'brace/mode/tex'
import 'brace/theme/monokai'

export default {
  name: 'Editor',
  props: ['editorId'],
  computed: mapState({
    content: state => state.editPage.content,
    lang: state => state.editPage.lang,
    theme: state => state.editPage.theme
  }),
  mounted () {
    const lang = this.lang || 'tex'
    const theme = this.theme || 'github'

    this.editor = ace.edit(this.editorId)
    this.editor.setValue(this.content, 1)

    this.editor.getSession().setMode(`ace/mode/${lang}`)
    this.editor.setTheme(`ace/theme/${theme}`)

    this.editor.on('change', () => {
      this.$store.commit(CONTENT_CHANGED_MUTATION, {
        content: this.editor.getValue()
      })
    })

    this.editor.commands.addCommands([
      {
        Name: 'savefile',
        bindKey: {
          win: 'Ctrl-S',
          mac: 'Command-S'
        },
        exec: (editor) => {
          this.$store.dispatch(CONTENT_SAVE_ACTION).then(() => {
            this.$store.dispatch(COMPILE_ACTION)
          })
        }
      }
    ])

    this.editor.$blockScrolling = Infinity

    this.$store.dispatch(CONTENT_LOAD_ACTION).then(() => {
      this.editor.setValue(this.content, -1)
      this.$store.dispatch(COMPILE_ACTION)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.editor {
  width: calc(50% - 5px);
  height: 100%;
}
</style>
