import axios from 'axios'
import PDFTeX from '../../libs/pdftex'
import {FILE_OPEN_ACTION} from './file_system'
import {stringToBuffer, utf8ToBase64, base64ToUtf8, bufferToBase64, getFileExtension, isImageFile, nameToMime} from './../../util/util'

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

const STORAGE_KEY = 'textlive-web'

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

async function prepareFile (pdftex) {
  /* eslint-disable */

  

  //const path = 'https://66.media.tumblr.com/ccbd02ca8f3e3a1d52e20c161c6a53f0/tumblr_phk63jWBu51v6xgkio1_500.jpg'
  //const path = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png'
  const path = 'http://localhost/texlive-web/static/demo/Vue.png'
  // var res = await axios.get('/static/Vue.png', { responseType: 'blob' })
  // var res = await axios.get(path, { responseType: 'arraybuffer' })
  var res = await axios.get(path, { responseType: 'binary' })
  // var url = window.URL.createObjectURL(res.data)
  // console.log(url)
  console.log(res.data.length)
  var base64 =  utf8ToBase64(res.data)
  window.base64 = 'data:image/png;base64,' + base64 
  // pdftex.FS_createDataFile('/', 'Vue.png', res.data, true, true)
  // pdftex.FS_createDataFile('/', 'test.txt', "hogehoge", true, true)

  const img = 'http://localhost/texlive-web/static/Vue.png'
  var buf1
  var buf0 = stringToBuffer( res.data )
  console.log(buf0)

  pdftex.FS_createFolder('/', 'demo', true, true)
  pdftex.FS_createLazyFile('/demo/', 'test.tex', '/static/demo/main.tex', true, true)
   
  await pdftex.FS_createLazyFile('/', 'Vue.png', path, true, false)
  var truePng = await pdftex.FS_readFile('Vue.png')
  var buf2 = stringToBuffer(truePng)
  console.log(buf2)

  //base64 = utf8_to_b64(truePng)
  //window.base64 = 'data:image/png;base64,' + base64 
  
  await pdftex.FS_createDataFile('/', 'test2.png', truePng, true, true)
  // pdftex.FS_createDataFile('/', 'test2.png', res.data, true, true)
  var r = await pdftex.FS_readFile('test2.png')
  buf1 = stringToBuffer(r)

  var buf12 = []
  var buf02 = []
  buf0 = new Uint8Array(buf0)
  buf1 = new Uint8Array(buf1)
  buf2 = new Uint8Array(buf2)
  console.log(buf1.length)

  for (var i = 0; i < buf1.length; i++) {
    buf12.push(buf1[i] - buf2[i])
    buf02.push(buf0[i] - buf2[i])
  }
  console.log(buf12)
  console.log(buf02)

  // var r1 = pdftex.FS_createDataFile('/', 'Vue.png', '/static/Vue.png', true, true)
/*
  var blob = new Blob(r2.result[0], { type: "image/png" });
  var url = URL.createObjectURL(blob);
  var image = new Image();
  image.src = url;
  console.log("data length: " + data.length);
  document.body.appendChild(image);
*/
  // console.log('set vue png')

  /* eslint-enable */
}

const state = {
  fileName: 'main.tex',
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
  [COMPILE_ACTION] ({state, commit}) {
    commit(COMPILE_START_MUTATION)

    /* eslint-disable no-undef */
    const pdfWorkerPath = './static/texlive.js/pdftex-worker.js'
    // const pdfWorkerPath = './static/libs/pdftex-worker.js'

    var pdftex = new PDFTeX(pdfWorkerPath)
    /* eslint-enable no-undef */

    let sourceCode = state.content

    pdftex.set_TOTAL_MEMORY(80 * 1024 * 1024).then(async () => {
      await prepareFile(pdftex)

      pdftex.on_stdout = appendOutput(commit, PDFTEX_OUTPUT_TYPES.INFO)
      pdftex.on_stderr = appendOutput(commit, PDFTEX_OUTPUT_TYPES.ERROR)
      pdftex.on_failed = (e) => {
        commit(COMPILE_FAILED_MUTATION, e)
        appendOutput(commit, PDFTEX_OUTPUT_TYPES.ERROR)(e)
      }

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
      commit(COMPILE_FAILED_MUTATION, e)
    })
  },
  [CONTENT_SAVE_ACTION] ({state, getters}) {
    localStorage.setItem(STORAGE_KEY, getters.serializedFileInfo)
  },
  async [CONTENT_LOAD_ACTION] ({state, commit, getters}) {
    var infoStr = localStorage.getItem(STORAGE_KEY)

    if (!infoStr) {
      const DEFAULT_TEX_FILE = '/static/demo/main.tex'
      var res = await axios.get(DEFAULT_TEX_FILE)
      state.content = res.data
      infoStr = getters.serializedFileInfo
    }

    var info = JSON.parse(infoStr)

    commit(CONTENT_CHANGED_MUTATION, info)
  },
  [FILE_OPEN_ACTION] ({state}, {name, directoryFullPath, env}) {
    var path = env.require('path')
    var fs = env.require('fs')
    state.selectedItemName = path.join(directoryFullPath, name)
    console.log(state)
    fs.readFile(path.join(directoryFullPath, name), (err, content) => {
      if (err) {
        console.log(err)
        return
      }

      if (isImageFile(name)) {
        state.visibleImageViewer = true
        state.imageViewerBase64 = bufferToBase64(content, nameToMime(name))
      } else {
        state.visibleImageViewer = false
        state.content = content.toString()
      }
    })
  }
}

const getters = {
  serializedFileInfo: state => {
    return JSON.stringify({
      fileName: state.fileName,
      content: state.content
    })
  },
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
