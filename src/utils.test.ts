import { describe, it, expect } from 'bun:test'
import { getDateFromNumber, getNumberDate, getValueFromExtended } from './utils'

describe('getNumberDate()', () => {
  it('returns number suited for gsheets from date', () => {
    expect(getNumberDate(new Date('1999-02-15'))).toEqual(36206)
  })
  it('returns number suited for gsheets from date', () => {
    const d = new Date('2024-03-25T00:00:00.000Z')
    expect(getNumberDate(new Date('2024-03-25T00:00:00.000Z'))).toEqual(45376)
  })
  it('returns number suited for gsheets from date', () => {
    expect(getNumberDate(new Date('2024-03-25T01:00:00.000Z'))).toEqual(45376.041666666664)
  })
  it('returns number suited for gsheets from date', () => {
    expect(getNumberDate(new Date('2024-03-25T23:00:00.000Z'))).toEqual(45376.958333333336)
  })
})

describe('getDateFromNumber()', () => {
  it('return date from gsheets number', () => {
    expect(getDateFromNumber(36206)).toEqual(new Date('1999-02-15'))
  })
  it('return date from gsheets number', () => {
    expect(getDateFromNumber(45376)).toEqual(new Date('2024-03-25T00:00:00.000Z'))
  })
})

describe('getValueFromExtended()', () => {
  it('return number for number value', () => {
    expect(getValueFromExtended({ effectiveValue: { numberValue: 2 } })).toStrictEqual(2)
  })
  it('return string for string value', () => {
    expect(getValueFromExtended({ effectiveValue: { stringValue: 'test' } })).toStrictEqual('test')
  })
  it('return boolean for bool value', () => {
    expect(getValueFromExtended({ effectiveValue: { boolValue: true } })).toStrictEqual(true)
  })
  it('return undefined if no value', () => {
    expect(getValueFromExtended({ effectiveValue: {} })).not.toBeDefined()
    expect(getValueFromExtended({ effectiveValue: { stringValue: '' } })).not.toBeDefined()
  })
})
