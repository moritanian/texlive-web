var PDFTeX = function (optWorkerPath) {
  if (!optWorkerPath) {
    optWorkerPath = 'pdftex-worker.js'
  }

  this.optWorkerPath = optWorkerPath

  var self = this
  var initialized = false

  this.promises = []
  this.onreadyResolve = null
  var onready = new Promise((resolve, reject) => {
    this.onreadyResolve = resolve
  })

  var curry = function (obj, fn, args) {
    return function () {
      return obj[fn].apply(obj, args)
    }
  }
  /* eslint-disable no-unused-vars */
  function determineChunkSize () {
    var size = 1024
    var max
    var min
    var delta = size
    var success = true
    var buf

    while (Math.abs(delta) > 100) {
      if (success) {
        min = size
        if (typeof (max) === 'undefined') {
          delta = size
        } else {
          delta = (max - size) / 2
        }
      } else {
        max = size
        if (typeof (min) === 'undefined') {
          delta = -1 * size / 2
        } else {
          delta = -1 * (size - min) / 2
        }
      }
      size += delta

      success = true
      try {
        buf = String.fromCharCode.apply(null, new Uint8Array(size))
        sendCommand({
          command: 'test',
          data: buf,
        })
      } catch (e) {
        success = false
      }
    }

    return size
  }
  /* eslint-enable no-unused-vars */

  this.initWorker()

  function initFile () {
    return curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true])()
  }

  var sendCommand = (cmd) => {
    return new Promise((resolve, reject) => {
      var msgId = this.promises.push(resolve) - 1

      onready.then(() => {
        cmd['msg_id'] = msgId
        // console.debug('> sending', cmd)
        this.worker.postMessage(JSON.stringify(cmd))
      })
    })
  }

  var createCommand = function (command) {
    self[command] = function () {
      var args = [].concat.apply([], arguments)

      return sendCommand({
        'command': command,
        'arguments': args,
      })
    }
  }
  createCommand('FS_createDataFile') // parentPath, filename, data, canRead, canWrite
  createCommand('FS_readFile') // filename
  createCommand('FS_unlink') // filename
  createCommand('FS_createFolder') // parent, name, canRead, canWrite
  createCommand('FS_createPath') // parent, name, canRead, canWrite
  createCommand('FS_createLazyFile') // parent, name, canRead, canWrite
  createCommand('FS_createLazyFilesFromList') // parent, list, parent_url, canRead, canWrite
  createCommand('set_TOTAL_MEMORY') // size

  self.compile = (sourceCode) => {
    return self.compileRaw(sourceCode).then((binaryPdf) => {
      return new Promise((resolve, reject) => {
        if (binaryPdf === false) {
          return reject(new Error('binaryPdf is false'))
        }

        var pdfDataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(binaryPdf)

        setTimeout(() => {
          this.initWorker()
          initFile()
        }, 1)

        return resolve(pdfDataurl)
      })
    })
  }

  self.compileRaw = function (sourceCode) {
    var commands
    if (initialized) {
      commands = [
        curry(self, 'FS_createDataFile', ['/', 'input.tex', sourceCode, true, true]),

      ]
    } else {
      commands = [
        curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true]),
        curry(self, 'FS_createDataFile', ['/', 'input.tex', sourceCode, true, true]),
      ]
    }

    var sendCompile = function () {
      initialized = true
      return sendCommand({
        'command': 'run',
        'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', 'input.tex', '-o', '/input.pdf'],
        // 'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
      })
    }

    var getPDF = function () {
      return self.FS_readFile('/input.pdf')
    }

    var p = commands[0]()
    for (let i = 1; i < commands.length; i++) {
      p = p.then(() => {
        return commands[i]()
      })
    }
    return p.then(sendCompile)
      .then(getPDF)
  }
}

PDFTeX.prototype.initWorker = function () {
  if (this.worker) {
    this.worker.terminate()
  }

  this.worker = new Worker(this.optWorkerPath)
  this.worker.addEventListener('error', (e) => { this.on_failed(e) }, false)

  this.worker.onmessage = (ev) => {
    var data = JSON.parse(ev.data)
    var msgId

    if (!('command' in data)) {
      console.log('missing command!', data)
    }
    switch (data['command']) {
      case 'ready':
        this.onreadyResolve(true)
        break
      case 'stdout':
      case 'stderr':
        this['on_' + data['command']](data['contents'])
        break
      default:
        // console.debug('< received', data)
        msgId = data['msg_id']
        if (('msg_id' in data) && (msgId in this.promises)) {
          this.promises[msgId](data['result'])
        } else {
          console.warn('Unknown worker message ' + msgId + '!')
        }
    }
  }
}

PDFTeX.prototype.on_stdout = function (msg) {
  console.log(msg)
}

PDFTeX.prototype.on_stderr = function (msg) {
  console.log(msg)
}

PDFTeX.prototype.on_failed = function (e) {
  console.error(e)
}

export default PDFTeX
