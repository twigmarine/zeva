import _ from 'lodash/fp'
import { setField } from 'prairie'
import {
  addFields, buildEncode, getFieldsData, hexToBuff, parseCanId,
} from 'nori-can'
import { getFieldInfo } from './zeva'

const getBytesLength = _.flow(_.nth(9), Number)
const dataSlice = (x) => x.slice(10)
const getData = _.flow(dataSlice, hexToBuff)

export function parseZevaCanId(canId) {
  if (_.inRange(300, 460, canId)) {
    const bpid = Math.floor(canId / 10)
    const moduleId = bpid - 30
    const packetId = canId - (bpid * 10)
    return { canId, moduleId, packetId }
  }
  return null
}
function addZevaCanIdInfo(input) {
  const zevaInfo = parseZevaCanId(input.canId)
  if (!zevaInfo) return input
  return { ...input, ...zevaInfo }
}

export function encodeZevaCanId(info, moduleId = 0) {
  if (_.isNumber(info.canId)) return _.pick(['canId', 'canIdHex'], info)
  const { packetId } = info
  if (_.isNumber(packetId)) {
    const bpid = (moduleId) * 10
    const canId = 300 + packetId + bpid
    return {
      canId,
      moduleId,
      packetId,
      bpid,
    }
  }
  console.error('UNEXPECTED encodeZevaCanId')
  return null
}

// export function parseStr(input) {
//   return {
//     prefix: input[0],
//     format: 'lawicel',
//     input,
//     byteLength: getBytesLength(input),
//     ...getCanId(input),
//     data: getData(input),
//   }
// }

function finishEncode(info, input, data) {
  const canIdInfo = encodeZevaCanId(info, input.moduleId)
  return {
    ...input,
    ...canIdInfo,
    info,
    data,
  }
}
export const encodeZeva = buildEncode(finishEncode, getFieldInfo)

export const parseZeva = _.flow(
  setField('fieldData', getFieldsData),
  addFields,
)
export const parse = _.flow(
  addZevaCanIdInfo,
  setField('info', getFieldInfo),
  (x) => ((x.info && x.info.fields) ? parseZeva(x) : x),
  // addFields,
)
export {
  getFieldInfo,
}
