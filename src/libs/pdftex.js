var PDFTeX = function (optWorkerPath) {
  if (!optWorkerPath) {
    optWorkerPath = 'pdftex-worker.js'
  }
  var worker = new Worker(optWorkerPath)
  var self = this
  var initialized = false

  self.on_stdout = function (msg) {
    console.log(msg)
  }

  self.on_stderr = function (msg) {
    console.log(msg)
  }

  self.on_failed = function (e) {
    console.error(e)
  }

  worker.addEventListener('error', (e) => { self.on_failed(e) }, false)

  worker.onmessage = function (ev) {
    var data = JSON.parse(ev.data)
    var msgId

    if (!('command' in data)) {
      console.log('missing command!', data)
    }
    switch (data['command']) {
      case 'ready':
        onreadyResolve(true)
        break
      case 'stdout':
      case 'stderr':
        self['on_' + data['command']](data['contents'])
        break
      default:
        // console.debug('< received', data)
        msgId = data['msg_id']
        if (('msg_id' in data) && (msgId in promises)) {
          promises[msgId](data['result'])
        } else {
          console.warn('Unknown worker message ' + msgId + '!')
        }
    }
  }

  var onreadyResolve
  var onready = new Promise((resolve, reject) => {
    onreadyResolve = resolve
  })

  var promises = []
  var chunkSize

  var sendCommand = function (cmd) {
    return new Promise((resolve, reject) => {
      var msgId = promises.push(resolve) - 1

      onready.then(() => {
        cmd['msg_id'] = msgId
        // console.debug('> sending', cmd)
        worker.postMessage(JSON.stringify(cmd))
      })
    })
  }

  var determineChunkSize = function () {
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

  var curry = function (obj, fn, args) {
    return function () {
      return obj[fn].apply(obj, args)
    }
  }

  self.compile = function (sourceCode) {
    return self.compileRaw(sourceCode).then((binaryPdf) => {
      return new Promise((resolve, reject) => {
        if (binaryPdf === false) {
          return reject(new Error('binaryPdf is false'))
        }

        var pdfDataurl = 'data:application/pdf;charset=binary;base64,' + window.btoa(binaryPdf)
        return resolve(pdfDataurl)
      })
    })
  }

  self.compileRaw = function (sourceCode) {
    if (typeof (chunkSize) === 'undefined') {
      chunkSize = determineChunkSize()
    }

    var commands
    if (initialized) {
      commands = [
        curry(self, 'FS_unlink', ['/input.tex']),
      ]
    } else {
      commands = [
        curry(self, 'FS_createDataFile', ['/', 'input.tex', sourceCode, true, true]),
        curry(self, 'FS_createLazyFilesFromList', ['/', 'texlive.lst', './texlive', true, true]),
      ]
    }

    var sendCompile = function () {
      initialized = true
      return sendCommand({
        'command': 'run',
        'arguments': ['-interaction=nonstopmode', '-output-format', 'pdf', 'input.tex'],
        // 'arguments': ['-debug-format', '-output-format', 'pdf', '&latex', 'input.tex'],
      })
    }

    var getPDF = function () {
      console.log(arguments)
      return self.FS_readFile('/input.pdf')
    }

    var p = commands[0]()
    for (var i = 1; i < commands.length; i++) {
      p = p.then(commands[i])
    }
    return p.then(sendCompile)
      .then(getPDF)
  }
}

export default PDFTeX
