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
export const FOLDER_OPEN_ACTION = 'FOLDER_OPEN_ACTION'

axios('/static/demo.zip', {responseType: 'arraybuffer'}).then((response) => {
  return response.data
}).then((zipData) => {
  var Buffer = BrowserFS.BFSRequire('buffer').Buffer

  BrowserFS.configure({
    fs: 'MountableFileSystem',
    options: {
      '/zip': {
        fs: 'ZipFS',
        options: {
          // Wrap as Buffer object.
          zipData: Buffer.from(zipData)
        }
      },
      '/workspace': {
        fs: 'OverlayFS',
        options: {
          readable: {
            fs: 'ZipFS',
            options: {
              zipData: Buffer.from(zipData)
            }
          },
          writable: {
            fs: 'IndexedDB',
            options: {
              storeName: 'site'
            }
          }
        }
      },
      '/tmp': { fs: 'InMemory' },
      '/home': { fs: 'IndexedDB', options: {} }
    }
  }, (e) => {
    if (e) {
      // An error occurred.
      throw e
    }
    // Otherwise, BrowserFS is ready to use!
    var env = {}
    BrowserFS.install(env)
    state.env = env
    initFileSystem()
  })
})

/*
// Grab the BrowserFS Emscripten FS plugin.
var BFS = new BrowserFS.EmscriptenFS()
console.log(BFS)
// Create the folder that we'll turn into a mount point.
BrowserFS.createFolder(BrowserFS.root, 'data', true, true)
// Mount BFS's root folder into the '/data' folder.
BrowserFS.mount(BFS, {root: '/'}, '/data')

*/

async function initFileSystem () {
  const fs = state.env.require('fs')
}

const state = {
  env: {},
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
}

export default {
  state,
  mutations,
  actions,
}
