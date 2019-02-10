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
import 'brace/mode/json'
import 'brace/mode/html'
import 'brace/mode/tex'
import 'brace/mode/text'
import 'brace/mode/markdown'
import 'brace/theme/monokai'
import {getFileExtension} from './../util/util'

const EXTENSION_LANG_TABLE = {
  'tex': 'tex',
  'js': 'javascript',
  'txt': 'text',
  'md': 'markdown',
  'css': 'css',
  'json': 'json',
  'html': 'html',
  'vue': 'html'
}

export default {
  name: 'Editor',
  props: ['editorId'],
  computed: mapState({
    content: state => state.editPage.content,
    selectedItemName: state => state.editPage.selectedItemName,
    lang: state => state.editPage.lang,
    theme: state => state.editPage.theme
  }),
  mounted () {
    const lang = this.lang || 'tex'
    const theme = this.theme || 'github'

    this.editor = ace.edit(this.editorId)
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
  /*
    this.$store.dispatch(CONTENT_LOAD_ACTION).then(() => {
      this.editor.setValue(this.content, -1)
      this.$store.dispatch(COMPILE_ACTION)
    })
  */
  },
  watch: {
    selectedItemName: {
      handler () {
        var ext = getFileExtension(this.selectedItemName)
        var lang = EXTENSION_LANG_TABLE[ext]
        if (!lang) {
          lang = EXTENSION_LANG_TABLE.txt
        }
        this.editor.getSession().setMode(`ace/mode/${lang}`)
        this.editor.setValue(this.content, -1)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
