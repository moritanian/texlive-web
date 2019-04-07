import {toBlob, bufferToBase64, stringToBuffer, bufferToString, utf8ToBase64, base64ToUtf8 ,getFileExtension, isImageFile, nameToMime, loadCORSImageURI, execDirectoryRecursive} from '@/util/util'
import axios from 'axios'

const minimumPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII='
const PNGMIME = 'image/png'
const testString = 'ab'
const testStringBuffer = (function () {
  var array = new Array(testString.length)
  for (var i = 0; i < array.length; i++) {
    array[i] = testString.charCodeAt(i)
  }
  var testBuffer = (new Int8Array(array)).buffer
  return testBuffer
}(testString))
const CORSImageURL = 'https://raw.githubusercontent.com/moritanian/texlive-web/master/sample.png'

const testBase64WithoutMime = 'YWI=' // 'ab'
const testBase64WithPngMime = `data:${PNGMIME};base64,${testBase64WithoutMime}`

const testBinaryBuffer = (function () {
  return new Int8Array([0xf0, 0xf1]).buffer // no ascii
})()
const testBase64FromBinaryWithoutMime = '8PE='
const testBase64FromBinaryWitMime = `data:${PNGMIME};base64,${testBase64FromBinaryWithoutMime}`

describe('toBlob', () => {
  it('testBase64WithoutMime', () => {
    var blob = toBlob(testBase64WithoutMime)
    expect(blob.type).toEqual('')
    expect(blob.size).toEqual(5)
  })
})

describe('bufferToBase64', () => {
  it('buffer from string', () => {
    expect(bufferToBase64(testStringBuffer, PNGMIME)).toEqual(testBase64WithPngMime)
  })
  it('buffer from binary', () => {
    expect(bufferToBase64(testBinaryBuffer, PNGMIME)).toEqual(testBase64FromBinaryWitMime)
  })
})

describe('stringToBuffer', () => {
  it('string', () => {
    var buffer = stringToBuffer(testString)
    var int8Arr = new Int8Array(buffer)
    for (var i = 0; i < testString.length; i++) {
      expect(int8Arr[i]).toEqual(testString.charCodeAt(i))
    }
  })
})

describe('bufferToString', () => {
  it('string ab', () => {
    var str = bufferToString(testStringBuffer)
    console.log(str)
    for (var i = 0; i < testString.length; i++) {
      expect(str[i]).toEqual(testString.charAt(i))
    }
  })
})

describe('loadCORSImageURL', () => {
  it('Not omit header', (done) => {
    loadCORSImageURI(CORSImageURL).then(base64 => {
      expect(base64.charCodeAt(0)).toEqual(105)
      done()
    })
  })
})

/*
describe('toBlob', () => {
  it('minimum png', () => {
    const Constructor = Vue.extend(HelloWorld)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
      .toEqual('Welcome to Your Vue.js App')
  })
})
*/
