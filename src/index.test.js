import _ from 'lodash/fp'
import { encodePgn, parseString } from 'nori-can'
import {
  encodeZeva, encodeZevaCanId, parse,
} from './index'
import { getFieldInfo } from './zeva'
/* globals describe test expect */

describe('parse', () => {
  const parseLawicel = _.flow(
    (x) => parseString(x, 'lawicel'),
    parse,
  )

  test('lawicel', () => {
    const input = 'T0000014180D330D2F0D300D33\r'
    const result = parseLawicel(input, 'lawicel')
    expect(result).toEqual(expect.objectContaining({
      format: 'lawicel',
      len: 8,
      prefix: 'T',
      input: 'T0000014180D330D2F0D300D33',
      canId: 321,
      moduleId: 2,
      packetId: 1,
    }))
    expect(result.info.id).toBe('replyData1')
  })
  test('broken', () => {
    const vals = parseLawicel('T1806E5F4803E8006400000000')
    expect(vals).toEqual(expect.objectContaining({
      canId: 403105268,
      input: 'T1806E5F4803E8006400000000',
      info: null,
    }))
  })
})

describe('encodeZeva', () => {
  test('requestData', () => {
    const volts = 3600
    const input = {
      id: 'requestData',
      moduleId: 0,
      field: { balancerShuntVolts: volts },
    }
    const outputInfo = encodeZeva(input)
    expect(outputInfo).toEqual({
      ...input,
      canId: 300,
      // canIdHex: '0000012C',
      packetId: 0,
      bpid: 0,
      info: {
        id: 'requestData',
        packetId: 0,
        byteLength: 2,
        fields: [
          {
            bitLength: 16,
            id: 'balancerShuntVolts',
            unit: 'millivolts',
            littleEndian: false,
            bitStart: 0,
            signed: false,
            name: 'BalancerShuntVolts',
            byteLength: 2,
            default: 0,
            position: 0,
            bitOffset: 0,
            byteStart: 0,
            withinByte: false,
            byteEnd: 2,
          },
        ],
      },
      data: Uint8Array.from([14, 16]),
      // output: 'T0000012C20E10',
    })
    expect(outputInfo.data[0]).toBe(volts >> 8) // eslint-disable-line no-bitwise
    expect(outputInfo.data[1]).toBe(volts & 0xFF) // eslint-disable-line no-bitwise
    expect(encodePgn('lawicel', outputInfo)).toBe('T0000012C20E10')
  })
})

// encode
describe('encodeZevaCanId', () => {
  const info = getFieldInfo({ id: 'requestData' })
  test('defaults', () => {
    const result = encodeZevaCanId(info)
    expect(result).toEqual({
      bpid: 0,
      canId: 300,
      // canIdHex: '0000012C',
      moduleId: 0,
      packetId: 0,
    })
  })
  test('module 0, 1, 2', () => {
    expect(encodeZevaCanId(info, 0).canId).toBe(300)
    const result = encodeZevaCanId(info, 1)
    expect(result.canId).toBe(310)
    // expect(result.canIdHex.length).toBe(8)
    expect(encodeZevaCanId(info, 2).canId).toBe(320)
  })
})
