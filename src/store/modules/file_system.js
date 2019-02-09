import * as BrowserFS from 'BrowserFS'
import axios from 'axios'
import {bufferToBase64, isImageFile} from './../../util/util'
/*
* Mutations
*/
export const UPLOAD_MODAL_OPEN_BUTTON_CLICKED = 'UPLOAD_MODAL_OPEN_BUTTON_CLICKED'
export const UPLOAD_MODAL_CLOSE_BUTTON_CLICKED = 'UPLOAD_MODAL_CLOSE_BUTTON_CLICKED'

/*
 * Actions
 */
// File upload
export const FILE_UPLOADED_ACTION = 'FILE_UPLOADED_ACTION'
export const FILE_OPEN_ACTION = 'FILE_OPEN_ACTION'

const env = {}

BrowserFS.install(env)
BrowserFS.configure({
  fs: 'LocalStorage'
}, (e) => {
  if (e) {
    // An error happened!
    throw e
  }
})

async function initFileSystem () {
  const png = 'http://localhost/texlive-web/static/demo/Vue.png'
  var res = await axios.get(png, { responseType: 'arraybuffer' })
  var base64String = btoa(String.fromCharCode(...new Uint8Array(res.data)))

  // require('fs') is changed by webpack
  const fs = env.require('fs')
  /*
  fs.writeFile('/src/test.txt', 'Cool, I can do this in the browser!', (err) => {
    if (err) {
      console.log(err)
      return
    }
    fs.readFile('/src/test.txt', (err, contents) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('%c' + contents.toString(), 'color: red')
    })
  })

  fs.writeFile('/Vue.png', base64String, 'base64', (err) => {
    console.log(err)
  })
  
  fs.mkdir('/src', (err) => {
    console.log(err)
  })
  */
}

initFileSystem()

const state = {
  env: env,
  visibleUploadModal: false
}

const mutations = {
  [UPLOAD_MODAL_CLOSE_BUTTON_CLICKED] (state) {
    state.visibleUploadModal = false
  },
  [UPLOAD_MODAL_OPEN_BUTTON_CLICKED] (state) {
    state.visibleUploadModal = true
  },
}

const actions = {
  [FILE_UPLOADED_ACTION] ({state}, {directoryFullPath, file}) {
    console.log(file)
    importFile(file).then((result) => {
      // console.log(result)
      var fs = state.env.require('fs')
      var path = state.env.require('path')
      console.log(result)
      console.log(path.join(directoryFullPath, file.name))

      if (isImageFile(name)) {
        fs.writeFile(path.join(directoryFullPath, file.name), result, 'base64', (e) => {
          console.log(e)
        })
      } else {
        fs.writeFile(path.join(directoryFullPath, file.name), result, (e) => {
          console.log(e)
        })
      }
    })

    function importFile (file) {
      if (isImageFile(file.name)) {
        return importImageFile(file)
      } else {
        return importTextFile(file)
      }
    }

    function importImageFile (file) {
      var reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.readAsDataURL(file)
      })
    }

    function importTextFile (file) {
      var reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.readAsText(file)
      })
    }
  }
}

export default {
  state,
  mutations,
  actions,
}
