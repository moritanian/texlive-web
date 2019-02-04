export const COMPILE_SUCCESSED_MUTATION = 'COMPILE_SUCCESSED_MUTATION'
export const COMPILE_START_MUTATION = 'COMPILE_START_MUTATION'
export const COMPILE_FAILED_MUTATION = 'COMPILE_FAILED_MUTATION'
export const CONTENT_CHANGED_MUTATION = 'CONTENT_CHANGED_MUTATION'

export const PDFVIEWER_LOAD_START_MUTATION = 'PDFVIEWER_LOAD_START_MUTATION'
export const PDFVIEWER_LOADED_MUTATION = 'PDFVIEWER_LOADED_MUTATION'

export const ON_PDFTEX_OUTPUT_MUTATION = 'ON_PDFTEX_OUTPUT_MUTATION'

export const PDF_ZOOMIN_MUTATION = 'PDF_ZOOMIN_MUTATION'
export const PDF_ZOOMOUT_MUTATION = 'PDF_ZOOMOUT_MUTATION'

export const TOGGLE_TEX_OUTPUT = 'TOGGLE_TEX_OUTPUT'

export const COMPILE_ACTION = 'COMPILE_ACTION'
export const CONTENT_SAVE_ACTION = 'CONTENT_SAVE_ACTION'
export const CONTENT_LOAD_ACTION = 'CONTENT_LOAD_ACTION'

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
  visibleTexOutput: false
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
  [PDFVIEWER_LOADED_MUTATION] (state, data) {
    state.pdfLoading = false
  },
  [PDF_ZOOMIN_MUTATION] (state) {
    var percent = state.pdfScalePercent + 10
    state.pdfScalePercent = validatePdfScalePercent(percent)
  },
  [PDF_ZOOMOUT_MUTATION] (state) {
    var percent = state.pdfScalePercent - 10
    state.pdfScalePercent = validatePdfScalePercent(percent)
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
  async [COMPILE_ACTION] ({state, commit}) {
    commit(COMPILE_START_MUTATION)

    /* eslint-disable no-undef */
    const pdfWorkerPath = './static/texlive.js/pdftex-worker.js'
    var pdftex = new PDFTeX(pdfWorkerPath)
    /* eslint-enable no-undef */

    let sourceCode = state.content

    pdftex.set_TOTAL_MEMORY(80 * 1024 * 1024).then(() => {
      // pdftex.FS_createLazyFile('/', 'snowden.jpg', 'snowden.jpg', true, true)
      pdftex.on_stdout = appendOutput(commit, 'info')
      pdftex.on_stderr = appendOutput(commit, 'error')
      console.time('Execution time')

      try {
        pdftex.compile(sourceCode).then((pdfDataURI) => {
          console.timeEnd('Execution time')
          if (pdfDataURI === false) {
            return
          }
          // showOpenButton(true);
          // window.location.href = "#open_pdf";
          // document.getElementById("open_pdf_btn").focus();

          commit(COMPILE_SUCCESSED_MUTATION, {
            pdfDataURI: pdfDataURI
          })
        })
      } catch (e) {
        console.log(e)
        commit(COMPILE_FAILED_MUTATION)
      }
    })
  },
  [CONTENT_SAVE_ACTION] ({state, getters}) {
    localStorage.setItem(STORAGE_KEY, getters.serializedFileInfo)
  },
  [CONTENT_LOAD_ACTION] ({state, commit, getters}) {
    var info
    var infoStr = localStorage.getItem(STORAGE_KEY)

    if (!infoStr) {
      infoStr = getters.serializedFileInfo
    }
    info = JSON.parse(infoStr)

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
  pdfScale: state => state.pdfScalePercent / 100
}

export default {
  state,
  mutations,
  actions,
  getters
}
