import * as google from 'googleapis'
import { SheetRow } from './types'
import { getValuesForRow, getValueFromExtended } from './utils'

export class SheetsClient extends google.sheets_v4.Sheets {
  header: string[]
  requests: google.sheets_v4.Schema$Request[] = []

  constructor(private spreadsheetId: string, private sheetId: number, header?: string[]) {
    const auth = new google.Auth.JWT({
      email: process.env.GOOGLE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_ACCOUNT_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    super({ auth })
    this.header = header ?? []
  }

  async getHeader(): Promise<string[]> {
    const response = await this.spreadsheets.getByDataFilter({
      spreadsheetId: this.spreadsheetId,
      requestBody: { dataFilters: [{ gridRange: { sheetId: this.sheetId, endRowIndex: 1 } }], includeGridData: true },
    })
    const data = response.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.map(value => getValueFromExtended(value) ?? '') as string[]
    return data ?? []
  }

  setHeader(header: string[]) {
    return this.requests.push({
      updateCells: {
        range: {
          sheetId: this.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        rows: [
          {
            values: header.map(title => ({ userEnteredValue: { stringValue: title } })),
          },
        ],
        fields: '*',
      },
    })
  }

  async getRows(): Promise<SheetRow[]> {
    const rows: SheetRow[] = []
    const response = await this.spreadsheets.getByDataFilter({
      spreadsheetId: this.spreadsheetId,
      requestBody: { dataFilters: [{ gridRange: { sheetId: this.sheetId, startRowIndex: 1 } }], includeGridData: true },
    })
    response.data.sheets?.[0]?.data?.[0]?.rowData?.forEach(row => {
      const values = row.values
      if (!values) return
      let sheetRow: SheetRow = {}
      this.header.forEach((title, index) => (sheetRow[title] = getValueFromExtended(values[index])))
      rows.push(sheetRow)
    })
    return rows
  }

  updateRow(index: number, row: SheetRow) {
    return this.requests.push({
      updateCells: {
        range: {
          sheetId: this.sheetId,
          startRowIndex: index,
          endRowIndex: index + 1,
        },
        rows: [
          {
            values: getValuesForRow(row, this.header),
          },
        ],
        fields: '*',
      },
    })
  }

  addRow(row: SheetRow) {
    this.requests.push({
      appendCells: {
        sheetId: this.sheetId,
        rows: [
          {
            values: getValuesForRow(row, this.header),
          },
        ],
        fields: '*',
      },
    })
  }

  deleteRow(index: number) {
    this.requests.push({
      deleteDimension: {
        range: {
          sheetId: this.sheetId,
          dimension: 'ROWS',
          startIndex: index,
          endIndex: index + 1,
        },
      },
    })
  }

  deleteRows(indexes: number[]) {
    indexes.sort((i1, i2) => i2 - i1).forEach(index => this.deleteRow(index))
  }

  deleteColumn(index: number) {
    return this.requests.push({
      deleteDimension: {
        range: {
          sheetId: this.sheetId,
          dimension: 'COLUMNS',
          startIndex: index,
          endIndex: index + 1,
        },
      },
    })
  }

  deleteColumns(indexes: number[]) {
    indexes.sort((i1, i2) => i2 - i1).forEach(index => this.deleteColumn(index))
  }

  clearSheet() {
    return this.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [{ deleteRange: { shiftDimension: 'ROWS', range: { sheetId: this.sheetId } } }],
      },
    })
  }

  commit() {
    return this.spreadsheets.batchUpdate({ spreadsheetId: this.spreadsheetId, requestBody: { requests: this.requests } })
  }
}
