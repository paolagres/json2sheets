export type SheetRow = {
  [columnName: string]: SheetCellValue
}

export type SheetCellValue = string | number | boolean | Date | { text: string; url: string } | undefined
