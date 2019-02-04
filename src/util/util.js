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

export {toBlob}
