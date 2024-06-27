import { sheets_v4 } from 'googleapis'
import { SheetCellValue, SheetRow } from './types'
import { roundToNearestMinutes } from 'date-fns'

export function formatRowValues(row: SheetRow, header: string[]): sheets_v4.Schema$CellData[] {
  const values: sheets_v4.Schema$CellData[] = []
  for (const title of header) {
    const value = row[title]
    if (typeof value === 'string') values.push({ userEnteredValue: { stringValue: value } })
    else if (typeof value === 'number') values.push({ userEnteredValue: { numberValue: value } })
    else if (typeof value === 'boolean') values.push({ userEnteredValue: { boolValue: value } })
    else if (value instanceof Date)
      values.push({
        userEnteredValue: {
          numberValue: getNumberDate(value),
        },
        userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'dd/mm/yyyy' } },
      })
    else if (value?.url)
      values.push({
        userEnteredValue: { stringValue: value.text },
        textFormatRuns: [{ format: { link: { uri: value.url } } }],
      })
    else values.push({ userEnteredValue: { stringValue: '' } })
  }
  return values
}

export function getValueFromCell(value?: sheets_v4.Schema$CellData): SheetCellValue {
  if (value?.hyperlink) return { text: value.effectiveValue?.stringValue ?? '', url: value.hyperlink }
  if (value?.effectiveFormat?.numberFormat?.type === 'DATE' && value.effectiveValue?.numberValue)
    return getDateFromNumber(value.effectiveValue.numberValue)
  return value?.effectiveValue?.numberValue ?? value?.effectiveValue?.boolValue ?? (value?.effectiveValue?.stringValue || undefined)
}

export function getNumberDate(date: Date) {
  return (date.getTime() - new Date('1899-12-30T00:00:00.000Z').getTime()) / (24 * 60 * 60 * 1000)
}

export function getDateFromNumber(numberDate: number) {
  return roundToNearestMinutes(new Date((numberDate - 25569) * (24 * 60 * 60 * 1000)))
}
