import _ from 'lodash/fp'
import { setField } from 'prairie'
import {
  addFields, buildEncode, byteString, canIdString, createData, getFieldsData, hexToBuff, parseCanId,
} from 'nori-can'
import { getFieldInfo } from './zeva'

const getBytesLength = _.flow(_.nth(9), Number)
const dataSlice = (x) => x.slice(10)
const getData = _.flow(dataSlice, hexToBuff)

function parseZevaCanId(canId) {
  if (_.inRange(300, 460, canId)) {
    const bpid = Math.floor(canId / 10)
    const moduleId = bpid - 30
    const packetId = canId - (bpid * 10)
    return { canId, moduleId, packetId }
  }
  return parseCanId(canId)
}

export function encodeZevaCanId(info, moduleId = 0) {
  if (_.isNumber(info.canId)) return _.pick(['canId', 'canIdHex'], info)
  const { packetId } = info
  if (_.isNumber(packetId)) {
    const bpid = (moduleId) * 10
    const canId = 300 + packetId + bpid
    return {
      canId,
      canIdHex: canIdString(canId),
      moduleId,
      packetId,
      bpid,
    }
  }
  console.error('UNEXPECTED encodeZevaCanId')
  return info
}

export const getCanId = _.flow(
  (x) => x.slice(1, 9),
  (x) => parseInt(x, 16),
  parseZevaCanId,
)

export function parseStr(input) {
  return {
    prefix: input[0],
    format: 'lawicel',
    input,
    byteLength: getBytesLength(input),
    ...getCanId(input),
    data: getData(input),
  }
}
export function encodeStr(byteLength, canIdHex, data) {
  return `T${canIdHex}${byteLength}${byteString(data, '')}`
}

export const encode2 = _.flow(
  encodeZevaCanId,
  createData,
  setField('output', encodeStr),
)

function finishEncode(info, input, data) {
  const canIdInfo = encodeZevaCanId(info, input.moduleId)
  return {
    ...input,
    ...canIdInfo,
    info,
    data,
    output: encodeStr(info.byteLength, canIdInfo.canIdHex, data),
  }
}
export const encodeZeva = buildEncode(finishEncode, getFieldInfo)

export const parseZeva = _.flow(
  setField('fieldData', getFieldsData),
  addFields,
)
export const parse = _.flow(
  _.toString,
  parseStr,
  setField('info', getFieldInfo),
  (x) => ((x.info && x.info.fields) ? parseZeva(x) : x),

  // addFields,
)
