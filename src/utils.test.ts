import { describe, it, expect } from 'bun:test'
import { getDateFromNumber, getNumberDate, getValueFromCell } from './utils'

describe('getNumberDate()', () => {
  it('returns number suited for gsheets from simple date', () => {
    expect(getNumberDate(new Date('2024-03-25'))).toEqual(45376)
  })
  it('returns number suited for gsheets from datetime at 00:00', () => {
    const d = new Date('2024-03-25T00:00:00.000Z')
    expect(getNumberDate(new Date('2024-03-25T00:00:00.000Z'))).toEqual(45376)
  })
  it('returns number suited for gsheets from datetime at 01:00', () => {
    expect(getNumberDate(new Date('2024-03-25T01:00:00.000Z'))).toEqual(45376.041666666664)
  })
  it('returns number suited for gsheets from datetime at 23:00', () => {
    expect(getNumberDate(new Date('2024-03-25T23:00:00.000Z'))).toEqual(45376.958333333336)
  })
})

describe('getDateFromNumber()', () => {
  it('return date from gsheets number with simple date', () => {
    expect(getDateFromNumber(45376)).toEqual(new Date('2024-03-25'))
  })
  it('return date from gsheets number with time', () => {
    expect(getDateFromNumber(45376.958333333336)).toEqual(new Date('2024-03-25T23:00:00.000Z'))
  })
})

describe('getValueFromCell()', () => {
  it('return number for number value', () => {
    expect(getValueFromCell({ effectiveValue: { numberValue: 2 } })).toStrictEqual(2)
  })
  it('return string for string value', () => {
    expect(getValueFromCell({ effectiveValue: { stringValue: 'test' } })).toStrictEqual('test')
  })
  it('return boolean for bool value', () => {
    expect(getValueFromCell({ effectiveValue: { boolValue: true } })).toStrictEqual(true)
  })
  it('return url for link value', () => {
    expect(getValueFromCell({ effectiveValue: { stringValue: 'link' }, hyperlink: 'https://ithaque-renovation.fr' })).toStrictEqual({
      text: 'link',
      url: 'https://ithaque-renovation.fr',
    })
  })
  it('return undefined if no value', () => {
    expect(getValueFromCell({ effectiveValue: {} })).not.toBeDefined()
    expect(getValueFromCell({ effectiveValue: { stringValue: '' } })).not.toBeDefined()
  })
})
