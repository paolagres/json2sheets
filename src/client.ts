import * as google from 'googleapis'
import { SheetRow } from './types'
import { getValuesForRow, getValueFromCell } from './utils'

export class SheetsClient extends google.sheets_v4.Sheets {
  requests: google.sheets_v4.Schema$Request[] = []
  header?: string[]

  constructor(private spreadsheetId: string, private sheetId: number) {
    const auth = new google.Auth.JWT({
      email: process.env.GOOGLE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_ACCOUNT_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    super({ auth })
  }

  async getHeader(): Promise<string[]> {
    if (!this.header) {
      const response = await this.spreadsheets.getByDataFilter({
        spreadsheetId: this.spreadsheetId,
        requestBody: { dataFilters: [{ gridRange: { sheetId: this.sheetId, endRowIndex: 1 } }], includeGridData: true },
      })
      const data = response.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.map(value => getValueFromCell(value) ?? '') as string[]
      this.header = data ?? []
    }
    return this.header
  }

  async setHeader(header: string[]) {
    const existingHeader = await this.getHeader()

    const columnsToDelete = existingHeader.filter(title => !header.includes(title))
    if (columnsToDelete.length > 0) this.deleteColumns(columnsToDelete.map(column => existingHeader.indexOf(column)))

    const columnsToAdd = header.filter(title => !existingHeader.includes(title))
    columnsToAdd.forEach(_ => this.addColumn())

    const newHeader = [...existingHeader.filter(title => header.includes(title)), ...columnsToAdd]

    this.header = newHeader
    return this.requests.push({
      updateCells: {
        range: {
          sheetId: this.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        rows: [
          {
            values: newHeader.map(title => ({
              userEnteredValue: { stringValue: title },
              userEnteredFormat: { backgroundColor: { red: 0.93, green: 0.93, blue: 0.93 }, textFormat: { bold: true } },
            })),
          },
        ],
        fields: '*',
      },
    })
  }

  async getRows(): Promise<SheetRow[]> {
    const rows: SheetRow[] = []
    const header = await this.getHeader()
    const response = await this.spreadsheets.getByDataFilter({
      spreadsheetId: this.spreadsheetId,
      requestBody: { dataFilters: [{ gridRange: { sheetId: this.sheetId, startRowIndex: 1 } }], includeGridData: true },
    })
    response.data.sheets?.[0]?.data?.[0]?.rowData?.forEach(row => {
      const values = row.values
      if (!values) return
      let sheetRow: SheetRow = {}
      header.forEach((title, index) => (sheetRow[title] = getValueFromCell(values[index])))
      rows.push(sheetRow)
    })
    return rows
  }

  async updateRow(index: number, row: SheetRow) {
    const header = await this.getHeader()
    return this.requests.push({
      updateCells: {
        range: {
          sheetId: this.sheetId,
          startRowIndex: index,
          endRowIndex: index + 1,
        },
        rows: [
          {
            values: getValuesForRow(row, header),
          },
        ],
        fields: '*',
      },
    })
  }

  async addRow(row: SheetRow) {
    const header = await this.getHeader()
    this.requests.push({
      appendCells: {
        sheetId: this.sheetId,
        rows: [
          {
            values: getValuesForRow(row, header),
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

  addColumn() {
    this.requests.push({
      appendDimension: {
        sheetId: this.sheetId,
        dimension: 'COLUMNS',
        length: 1,
      },
    })
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
