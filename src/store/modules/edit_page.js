import PDFTeX from '../../libs/pdftex'
import {FILE_OPEN_ACTION, FOLDER_OPEN_ACTION} from './file_system'
import {bufferToString, bufferToBase64, isImageFile, nameToMime, execDirectoryRecursive} from './../../util/util'

/*
* Mutations
*/

// Tex Compile
export const COMPILE_SUCCESSED_MUTATION = 'COMPILE_SUCCESSED_MUTATION'
export const COMPILE_START_MUTATION = 'COMPILE_START_MUTATION'
export const COMPILE_FAILED_MUTATION = 'COMPILE_FAILED_MUTATION'
export const CONTENT_CHANGED_MUTATION = 'CONTENT_CHANGED_MUTATION'

// PdfViewer
export const PDFVIEWER_LOAD_START_MUTATION = 'PDFVIEWER_LOAD_START_MUTATION'
export const PDFVIEWER_LOADED_MUTATION = 'PDFVIEWER_LOADED_MUTATION'

export const ON_PDFTEX_OUTPUT_MUTATION = 'ON_PDFTEX_OUTPUT_MUTATION'

export const PDF_ZOOMIN_MUTATION = 'PDF_ZOOMIN_MUTATION'
export const PDF_ZOOMOUT_MUTATION = 'PDF_ZOOMOUT_MUTATION'
export const PDF_CHANGED_CURRENT_PAGE_MUTATION = 'PDF_CHANGED_CURRENT_PAGE_MUTATION'

export const TOGGLE_TEX_OUTPUT = 'TOGGLE_TEX_OUTPUT'

/*
 * Actions
 */

// Tex Compile
export const COMPILE_ACTION = 'COMPILE_ACTION'
export const CONTENT_SAVE_ACTION = 'CONTENT_SAVE_ACTION'
export const CONTENT_LOAD_ACTION = 'CONTENT_LOAD_ACTION'

export const PDFTEX_OUTPUT_TYPES = {
  INFO: 'INFO',
  ERROR: 'ERROR'
}

const validatePdfScalePercent = (percent) => {
  const MIN_PERCENT = 10
  const MAX_PERCENT = 1000

  if (percent < MIN_PERCENT) {
    percent = MIN_PERCENT
  } else if (percent > MAX_PERCENT) {
    percent = MAX_PERCENT
  }

  return percent
}

const initPdfTex = async (commit) => {
  const pdfWorkerPath = './static/texlive.js/worker.js'

  var pdftex = new PDFTeX(pdfWorkerPath)

  pdftex.on_stdout = appendOutput(commit, PDFTEX_OUTPUT_TYPES.INFO)
  pdftex.on_stderr = appendOutput(commit, PDFTEX_OUTPUT_TYPES.ERROR)
  pdftex.on_failed = (e) => {
    commit(COMPILE_FAILED_MUTATION, e)
    appendOutput(commit, PDFTEX_OUTPUT_TYPES.ERROR)(e)
  }

  return pdftex
}

async function prepareFile (pdftex, fs, path, rootPath) {
  return execDirectoryRecursive(fs, path, rootPath, (fs, path, targetPath, isDirectory) => {
    return new Promise((resolve, reject) => {
      var parsed = path.parse(targetPath)
      var relativePath = path.relative(rootPath, parsed.dir) || '/'

      if (relativePath === '..') {
        return resolve()
      }

      if (isDirectory) {
        pdftex.FS_createFolder(relativePath, parsed.base, true, true).then(() => {
          resolve()
        }).catch(reject)
      } else {
        fs.readFile(targetPath, (err, content) => {
          if (err) {
            return reject(err)
          }

          pdftex.FS_createDataFile(relativePath, parsed.base, bufferToString(content), true, true).then(() => {
            resolve()
          }).catch(reject)
        })
      }
    })
  })
}

const state = {
  pdftex: null,
  workspacePath: '/workspace/demo',
  targetTexFile: 'main.tex',
  content: '',
  selectedItemName: '',
  lang: 'tex',
  theme: 'monokai',
  pdftexOutputList: [],
  pdfLoading: false,
  pdfDataURI: '',
  pdfScalePercent: 50,
  compiling: false,
  visibleTexOutput: false,
  pdfTotalPageCount: 1,
  pdfCurrentPage: 1,
  visibleUploadModal: false,
  visibleImageViewer: false,
  imageViewerBase64: null,
}

const mutations = {
  [COMPILE_START_MUTATION] (state) {
    state.compiling = true
    state.pdftexOutputList = []
  },
  [COMPILE_SUCCESSED_MUTATION] (state, data) {
    state.pdfDataURI = data.pdfDataURI
    state.compiling = false
  },
  [COMPILE_FAILED_MUTATION] (state) {
    state.compiling = false
  },
  [CONTENT_CHANGED_MUTATION] (state, data) {
    state.content = data.content
  },
  [ON_PDFTEX_OUTPUT_MUTATION] (state, data) {
    state.pdftexOutputList.push({
      type: data.type,
      output: JSON.stringify(data.output)
    })
  },
  [PDFVIEWER_LOAD_START_MUTATION] (state, data) {
    state.pdfLoading = true
  },
  [PDFVIEWER_LOADED_MUTATION] (state, totalPageCount) {
    state.pdfLoading = false
    state.pdfTotalPageCount = totalPageCount
  },
  [PDF_ZOOMIN_MUTATION] (state) {
    var percent = state.pdfScalePercent + 10
    state.pdfScalePercent = validatePdfScalePercent(percent)
  },
  [PDF_ZOOMOUT_MUTATION] (state) {
    var percent = state.pdfScalePercent - 10
    state.pdfScalePercent = validatePdfScalePercent(percent)
  },
  [PDF_CHANGED_CURRENT_PAGE_MUTATION] (state, page) {
    state.pdfCurrentPage = page
  },
  [TOGGLE_TEX_OUTPUT] (state) {
    state.visibleTexOutput = !state.visibleTexOutput
  }
}

const appendOutput = (commit, type) => (msg) => {
  commit(ON_PDFTEX_OUTPUT_MUTATION, {
    output: msg,
    type: type
  })
}

const actions = {
  async [COMPILE_ACTION] ({state, commit, rootState}) {
    commit(COMPILE_START_MUTATION)

    var fs = rootState.fileSystem.env.require('fs')
    var path = rootState.fileSystem.env.require('path')

    let sourceCode = state.content

    let promise = Promise.resolve(this.pdftex)
    if (!this.pdftex) {
      promise = initPdfTex(commit)
    }

    promise.then(async (pdftex) => {
      this.pdftex = pdftex

      // await pdftex.set_TOTAL_MEMORY(80 * 1024 * 1024)
      await pdftex.set_TOTAL_MEMORY(0)
      await prepareFile(pdftex, fs, path, state.workspacePath)

      console.time('Execution time')
      var pdfDataURI = await pdftex.compile(sourceCode)
      console.timeEnd('Execution time')

      if (pdfDataURI === false) {
        return commit(COMPILE_FAILED_MUTATION)
      }

      commit(COMPILE_SUCCESSED_MUTATION, {
        pdfDataURI: pdfDataURI
      })
    }).catch((e) => {
      console.log(e)
      console.timeEnd('')
      commit(COMPILE_FAILED_MUTATION, e)
    })
  },
  [CONTENT_SAVE_ACTION] ({state, rootState, getters}) {
    var fs = rootState.fileSystem.env.require('fs')
    fs.writeFile(state.selectedItemName, state.content, (err) => {
      if (err) {
        console.log(err)
        return false
      }
    })
    // localStorage.setItem(STORAGE_KEY, getters.serializedFileInfo)
  },
  async [CONTENT_LOAD_ACTION] ({state, commit, getters, rootState}) {
    var fs = rootState.fileSystem.env.require('fs')
    fs.readFile(state.targetTexFile, state.content, (err) => {
      if (err) {
        console.log(err)
        return false
      }
    })

    commit(CONTENT_CHANGED_MUTATION)
  },
  [FILE_OPEN_ACTION] ({state, rootState}, {filePath}) {
    var env = rootState.fileSystem.env
    var fs = env.require('fs')

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.log(err)
          return reject(err)
        }

        if (isImageFile(filePath)) {
          state.visibleImageViewer = true
          state.imageViewerBase64 = bufferToBase64(content, nameToMime(filePath))
        } else {
          state.visibleImageViewer = false
          state.content = content.toString()
        }

        state.selectedItemName = filePath
        resolve(filePath)
      })
    })
  },
  [FOLDER_OPEN_ACTION] ({state, rootState}, {folderPath}) {
    console.log('folder open', folderPath)
    state.selectedItemName = folderPath
  }
}

const getters = {
  pdfScale: state => state.pdfScalePercent / 100,
  pdftexOutputErrorCount: state => {
    return state.pdftexOutputList.filter((output) => {
      return output.type === PDFTEX_OUTPUT_TYPES.ERROR
    }).length
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
