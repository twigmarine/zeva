import _ from 'lodash/fp'
import { onTrue } from 'understory'
import { setFieldWith } from 'prairie'
import { canIdString, prepFields } from 'nori-can'

// 0.25 W per node
// packetId 300 + 10
// Module ID 0 will use packet IDs 300 to 304
// Module ID 1 will use packet IDs 310 to 314, and so on.
// **big endian format**

const fixInfo = _.flow(
  prepFields,
  onTrue(_.has('canId'), setFieldWith('canIdHex', 'canId', canIdString)),
)

const errors = [
  {
    value: 0,
    label: 'No error',
  },
  {
    value: 1,
    label: 'Corrupt settings',
    description: 'Invalid settings value detected in memory',
  },
  {
    value: 2,
    label: 'Overcurrent warning',
    description: 'Current has exceeded the warning threshold',
  },
  {
    value: 3,
    label: 'Overcurrent shutdown',
    description: 'Current has exceeded fault threshold (drive shut down)',
  },
  {
    value: 4,
    label: 'Low cell warning',
    description: 'One or more cells below minimum voltage threshold',
  },
  {
    value: 5,
    label: 'BMS shutdown',
    description: 'Vehicle shutdown due to undervoltage cell for 10+ seconds',
  },
  {
    value: 6,
    label: 'High cell warning',
    description: 'One or more cells above maximum voltage threshold',
  },
  {
    value: 7,
    label: 'BMS ended charge',
    description: 'Charger has been stopped due to overvoltage cell for >1sec',
  },
  {
    value: 8,
    label: 'BMS over-temp',
    description: 'A BMS module has reported a temperature above limit',
  },
  {
    value: 9,
    label: 'BMS under-temp',
    description: 'A BMS module has reported a temperature below lower limit',
  },
  {
    value: 10,
    label: 'Low SoC warning',
    description: 'Battery state of charge has passed the low warning level',
  },
  {
    value: 11,
    label: 'Overtemperature',
    description: 'Temp input on Core has exceeded warning level',
  },
  {
    value: 12,
    label: 'Isolation error',
    description: 'Insulation fault detected above warning level',
  },
  {
    value: 13,
    label: 'Low 12V',
    description: '12V / aux battery voltage below warning level for >5 sec',
  },
  {
    value: 14,
    label: 'Precharge failed',
    description: 'An error was detected during precharge (failed to start or failed to complete, possibly due to faulty wiring)',
  },
  {
    value: 15,
    label: 'Contator switch error',
    description: 'Mismatch between contactor state and its auxiliary switch (faulty or seized contactor likely)',
  },
  {
    value: 16,
    label: 'CAN error',
    description: 'A CAN communications error was detected',
  },
]
export const dataPackets = [
  {
    id: 'requestData',
    packetId: 0,
    byteLength: 2,
    fields: [
      {
        bitLength: 16, id: 'balancerShuntVolts', unit: 'millivolts', littleEndian: false, default: 0,
      },
    ],
  },
  {
    id: 'replyData1',
    packetId: 1,
    fields: [
      {
        bitLength: 16, id: 'cellVolts1', name: 'Cell 1 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts2', name: 'Cell 2 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts3', name: 'Cell 3 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts4', name: 'Cell 4 Volts', unit: 'millivolts', littleEndian: false,
      },
    ],
  },
  {
    id: 'replyData2',
    packetId: 2,
    fields: [
      {
        bitLength: 16, id: 'cellVolts5', name: 'Cell 5 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts6', name: 'Cell 6 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts7', name: 'Cell 7 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts8', name: 'Cell 8 Volts', unit: 'millivolts', littleEndian: false,
      },
    ],
  },
  {
    id: 'replyData3',
    packetId: 3,
    fields: [
      {
        bitLength: 16, id: 'cellVolts9', name: 'Cell 9 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts10', name: 'Cell 10 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts11', name: 'Cell 11 Volts', unit: 'millivolts', littleEndian: false,
      },
      {
        bitLength: 16, id: 'cellVolts12', name: 'Cell 12 Volts', unit: 'millivolts', littleEndian: false,
      },
    ],
  },
  {
    id: 'temp',
    packetId: 4,
    fields: [
      {
        bitLength: 8, id: 'temp1', unit: 'c', offset: 40,
      },
      {
        bitLength: 8, id: 'temp2', unit: 'c', offset: 40,
      },
    ],
  },
].map(fixInfo)
export const dataPacketMap = new Map(dataPackets.map((x) => [x.packetId, x]))

export const messages = [
  {
    id: 'status',
    canId: 30,
    fields: [
      {
        bitLength: 3,
        id: 'status',
        enumValues: [
          [
            0,
            'Idle',
          ],
          [
            1,
            'Precharging',
          ],
          [
            2,
            'Running',
          ],
          [
            3,
            'Charging',
          ],
          [
            4,
            'Stopped',
          ],
        ],
      },
      {
        bitLength: 5,
        id: 'error',
        enumValues: _.map(_.at(['value', 'label']), errors),
      },
      {
        bitLength: 16, id: 'ahRemaining', resolution: 0.1, littleEndian: false,
      },
      {
        bitLength: 16, id: 'batteryVoltage', resolution: 0.1, littleEndian: false,
      },
      {
        bitLength: 8, id: 'auxVolts', resolution: 0.1, littleEndian: false,
      },
      { bitLength: 7, id: 'isolation' },
      { bitLength: 1, id: 'headlights' },
      { bitLength: 8, id: 'temp' },
    ],
  },
  {
    id: 'setState',
    canId: 31,
    fields: [
      { bitLength: 1, id: 'enabled' },
    ],
  },
  {
    id: 'configData1',
    canId: 32,
    fields: [
      {
        bitLength: 8, id: 'ahCapacity', min: 1, max: 250,
      },
      {
        bitLength: 8, id: 'socWarning', min: 0, max: 99,
      },
      {
        bitLength: 8, id: 'fullVoltage', min: 5, max: 251, resolution: 2,
      },
      { bitLength: 8, id: 'warnCurrent', resolution: 10 },
      { bitLength: 8, id: 'tripCurrent', resolutiON: 10 },
      { bitLength: 8, id: 'tempWarning', max: 151 },
      {
        bitLength: 8, id: 'minAuxVolts', min: 8, max: 15,
      },
      { bitLength: 8, id: 'minIsolation', max: 99 },
    ],
  },
  {
    id: 'configData2',
    canId: 33,
    fields: [
      {
        bitLength: 8, id: 'tachoPPR', min: 1, max: 6,
      },
      {
        bitLength: 8, id: 'fuelGaugeFull', min: 0, max: 100,
      },
      {
        bitLength: 8, id: 'fuelGaugeEmpty', min: 0, max: 100,
      },
      {
        bitLength: 8, id: 'tempGaugeHot', min: 0, max: 100,
      },
      {
        bitLength: 8, id: 'tempGaugeCold', min: 0, max: 100,
      },
      {
        bitLength: 8, id: 'bmsMinVolts', min: 0, max: 250, offset: 1.5, resolution: 0.01,
      },
      {
        bitLength: 8, id: 'bmsMaxVolts', min: 8, max: 250, offset: 2.0, resolution: 0.01,
      },
      {
        bitLength: 8, id: 'balanceVoltage', max: 252, offset: 2.0, resolution: 0.01,
      },
    ],
  },
  {
    id: 'configData3',
    canId: 34,
    fields: [
      {
        bitLength: 8, id: 'bmsHysteresis', min: 1, max: 50, resolution: 0.01,
      },
      {
        bitLength: 8, id: 'bmsMinTemp', min: 0, max: 141, offset: 40,
      },
      {
        bitLength: 8, id: 'bmsMaxTemp', min: 0, max: 141, offset: 40,
      },
      {
        bitLength: 9, id: 'maxChargeVolts', min: 0, max: 255,
      },
      {
        bitLength: 7, id: 'maxChargeCurrent', min: 0, max: 255,
      },
      {
        bitLength: 8, id: 'altChargeVolts', min: 0, max: 255,
      },
      {
        bitLength: 8, id: 'altChargeCurrent', min: 8, max: 255,
      },
      {
        bitLength: 8, id: 'sleepDelay', min: 1, max: 6,
      },
    ],
  },
  {
    id: 'configData4',
    canId: 35,
    fields: [
      {
        bitLength: 8,
        id: 'mpiFunction',
        min: 1,
        max: 3,
        options: [
          { value: 0, label: 'Wake Up', description: 'Join terminal to ground/chassis momentarily to wake the EVMS from sleep mode.' },
          { value: 1, label: 'Alt Charge', description: 'Join terminal to ground/chassis to switch TC Charger to second (“Alt”) set of voltage and current settings. Useful if you sometimes use two different bitLengthd chargers, or if you sometimes need to restrict a large charger from overloading a small AC socket.' },
          { value: 2, label: 'Headlight In', description: 'Headlight Input. Connect MPI terminal to the headlight signal in your car (+12V when headlights are on) to have the EVMS automatically dim the Monitor brightness at night, based on the Night Brightness setting.' },
          { value: 3, label: 'Ctr Aux Sw', description: 'Contactor Auxiliary Switch. Wire the MPI terminal to the auxiliary switch of your main contactor (with the other side of the switch connected to ground) to have the EVMS monitor the state of the aux switch. This allows the EVMS to provide a warning if the contactor is not working correctly (not closing when it should close, or not opening when it should open).' },
        ],
      },
      {
        bitLength: 8, id: 'mpo1Function', min: 0, max: 6,
      },
      {
        bitLength: 8, id: 'mpo2Function', min: 0, max: 6,
      },
      {
        bitLength: 8, id: 'parallelStrings', min: 0, max: 20,
      },
      {
        bitLength: 8, id: 'EnablePrecharge', min: 0, max: 1,
      },
      {
        bitLength: 8, id: 'stationaryMode', min: 0, max: 1,
      },
      { bitLength: 8, id: 'reserved' },
      { bitLength: 8, id: 'reserved' },
    ],
  },
  {
    id: 'cellNumbers',
    canId: 36,
    fields: [
      { bitLength: 4, id: 'module0Cells' },
      { bitLength: 4, id: 'module1Cells' },
      { bitLength: 4, id: 'module2Cells' },
      { bitLength: 4, id: 'module3Cells' },
      { bitLength: 4, id: 'module4Cells' },
      { bitLength: 4, id: 'module5Cells' },
      { bitLength: 4, id: 'module6Cells' },
      { bitLength: 4, id: 'module7Cells' },
      { bitLength: 4, id: 'module8Cells' },
      { bitLength: 4, id: 'module9Cells' },
      { bitLength: 4, id: 'module10Cells' },
      { bitLength: 4, id: 'module11Cells' },
      { bitLength: 4, id: 'module12Cells' },
      { bitLength: 4, id: 'module13Cells' },
      { bitLength: 4, id: 'module14Cells' },
      { bitLength: 4, id: 'module15Cells' },
    ],
  },
  {
    id: 'acknowledgeError',
    canId: 37,
    fields: [
      { bitLength: 8, id: 'errorCode' },
    ],
  },
  {
    id: 'resetStateOfCharge',
    canId: 38,
    fields: [
      { bitLength: 1, id: 'reset' },
    ],
  },
  {
    id: 'batteryCurrent',
    canId: 40,
    fields: [
      {
        bitLength: 24, id: 'current', unit: 'milliamps', offset: 8388608, littleEndian: false,
      },
    ],
  },
].map(fixInfo)

// console.log(messages.map(_.get('fields')))
export const messagesMap = new Map(messages.map((x) => [x.canId, x]))

export const getById = _.flow(
  _.flatten,
  _.keyBy('id'),
  _.propertyOf,
)([dataPackets, messages])

export function getFieldInfo({ canId, id, packetId }) {
  if (_.isString(id)) {
    const info = getById(id)
    if (info) return info
  }
  // console.log(canId, packetId)
  if (_.isNumber(packetId)) return dataPacketMap.get(packetId)
  if (canId) {
    const info = messagesMap.get(canId)
    if (!_.isEmpty(info)) return info
  }
  console.log('getFieldInfo NOT FOUND', canId, id, packetId)
  return null
}
