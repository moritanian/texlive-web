import mime from 'mime'

// https://www.hos.co.jp/blog/20170213/
/**
 * Base64とMIMEコンテンツタイプからBlobオブジェクトを作成する。
 * 日本語対応。
 *
 * @param base64
 * @param mime_ctype MIMEコンテンツタイプ
 * @returns Blob
 */
function toBlob (base64, mimeCtype) {
  // 日本語の文字化けに対処するためBOMを作成する。
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF])

  var bin = atob(base64.replace(/^.*,/, ''))
  var buffer = new Uint8Array(bin.length)
  for (var i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i)
  }
  // Blobを作成
  try {
    var blob = new Blob([bom, buffer.buffer], {
      type: mimeCtype,
    })
  } catch (e) {
    return false
  }
  return blob
}

function bufferToBase64 (buffer, mimeCtype) {
  var base64 = new Buffer(buffer, 'binary').toString('base64')
  var prefix = ''
  if (!base64.match(/^data/)) {
    prefix = `data:${mimeCtype};base64,`
  }
  console.log('prefix', prefix)
  return prefix + base64
}

function stringToBuffer (src) {
  return (new Uint8Array([].map.call(src, function (c) {
    return c.charCodeAt(0)
  }))).buffer
}

function utf8ToBase64 (str) {
  return window.btoa(unescape(encodeURIComponent(str)))
}

function base64ToUtf8 (str) {
  return decodeURIComponent(escape(window.atob(str)))
}

function getFileExtension (name) {
  return name.split('.').pop().toLowerCase()
}

function isImageFile (name) {
  const imageExtensions = [
    'png', 'jpg', 'jpeg', 'gif'
  ]
  var ext = getFileExtension(name)
  return imageExtensions.indexOf(ext) >= 0
}

function nameToMime (name) {
  var ext = getFileExtension(name)
  return mime.getType(ext)
}

export {toBlob, bufferToBase64, stringToBuffer, utf8ToBase64, base64ToUtf8, getFileExtension, isImageFile, nameToMime}
