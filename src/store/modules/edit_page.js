import axios from 'axios'
import PDFTeX from '../../libs/pdftex'

export const COMPILE_SUCCESSED_MUTATION = 'COMPILE_SUCCESSED_MUTATION'
export const COMPILE_START_MUTATION = 'COMPILE_START_MUTATION'
export const COMPILE_FAILED_MUTATION = 'COMPILE_FAILED_MUTATION'
export const CONTENT_CHANGED_MUTATION = 'CONTENT_CHANGED_MUTATION'

export const PDFVIEWER_LOAD_START_MUTATION = 'PDFVIEWER_LOAD_START_MUTATION'
export const PDFVIEWER_LOADED_MUTATION = 'PDFVIEWER_LOADED_MUTATION'

export const ON_PDFTEX_OUTPUT_MUTATION = 'ON_PDFTEX_OUTPUT_MUTATION'

export const PDF_ZOOMIN_MUTATION = 'PDF_ZOOMIN_MUTATION'
export const PDF_ZOOMOUT_MUTATION = 'PDF_ZOOMOUT_MUTATION'
export const PDF_CHANGED_CURRENT_PAGE_MUTATION = 'PDF_CHANGED_CURRENT_PAGE_MUTATION'

export const TOGGLE_TEX_OUTPUT = 'TOGGLE_TEX_OUTPUT'

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

const state = {
  fileName: 'main.tex',
  content: '',
  lang: 'tex',
  theme: 'monokai',
  pdftexOutputList: [],
  pdfLoading: false,
  pdfDataURI: '',
  pdfScalePercent: 50,
  compiling: false,
  visibleTexOutput: false,
  pdfTotalPageCount: 1,
  pdfCurrentPage: 1
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
      const DEFAULT_TEX_FILE = '/static/main.tex'
      var res = await axios.get(DEFAULT_TEX_FILE)
      state.content = res.data
      infoStr = getters.serializedFileInfo
    }

    var info = JSON.parse(infoStr)

    commit(CONTENT_CHANGED_MUTATION, info)
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
