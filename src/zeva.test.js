import { getFieldInfo } from './zeva'

/* globals describe test expect */

describe('getFieldInfo', () => {
  test('valid id', () => {
    const info = getFieldInfo({ id: 'requestData' })
    expect(info).toEqual({
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
    })
  })
})
