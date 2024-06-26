# json2sheets

A library built with Bun and Google API client to import data into Google Sheets.

## Installation

To install json2sheets, run the following command:

```
npm install json2sheets
```

## Usage

To use json2sheets, you need to create a new instance of the SheetsClient class, passing the spreadsheetId, sheetId, and an optional header as arguments.

```typescript
const { SheetsClient } = require('json2sheets')

const client = new SheetsClient('spreadsheetId', 'sheetId', ['header1', 'header2', 'header3'])
```

## `SheetsClient`

The `SheetsClient` class uses a JWT authentication strategy, you will need to provide the `GOOGLE_ACCOUNT_EMAIL` and `GOOGLE_ACCOUNT_PRIVATE_KEY` as environment variables.

The class is initialized with the `spreadsheetId`, the `sheetId` and an optional `header`.

### Retrieving data

You can get the header and rows data using the `getHeader` and `getRows` methods.

```typescript
const client = new SheetsClient('spreadsheetId', 'sheetId')

client.getHeader()
// Returns the header row from the sheet
// Example output : ['Name', 'Date', 'Status', 'Link']

client.getRows()
// Returns all rows from the sheet as an array of objects with keys corresponding to the header row
// Example output :
// [
//     {
//         Name: 'Send email',
//         Date: '2023-03-02T13:07:00.000Z',
//         Status: 'Done',
//         Link: { text: "john.doe@gmail.com", url: "mailto:john.doe@gmail.com" }
//     }
// ]
```

### Writing data

All `batchUpdate` requests are queued and need to be sent using `commit()`

```typescript
const client = new SheetsClient('spreadsheetId', 'sheetId')

// Sets the sheet header row and uses it for data keys
// Compares provided header with existing and adds, deletes and updates columns
client.setHeader(['Name', 'Date', 'Status', 'Link'])

// Updates data in the specified row with the provided data
client.updateRow(2, { Name: 'Send email', Date: '2023-03-02T13:07:00.000Z', Status: 'Done' })

// Adds new rows with provided data at the end of the sheet
client.addRows([{ Name: 'Send email', Date: '2023-03-02T13:07:00.000Z', Status: 'Done' }])

// Adds the provided number of columns at the end of the sheet
client.addColumns(2)

// Deletes the specified row or column from the sheet
client.deleteRow(2)
client.deleteColumn(2)

// Deletes the specified rows or columns from the sheet
// Multiple rows or columns are deleted in descending index order
client.deleteRows([2, 4])
client.deleteColumns([2, 4])

// Sends request
client.commit()
```

### Clearing data

```typescript
const client = new SheetsClient('spreadsheetId', 'sheetId')

// Clears all the data from the sheet
client.clearSheet()
```

## Note

This package uses the `googleapis` library to interact with the Google Sheets API, so you will need to make sure that you have properly set up a project in the Google Cloud Console and enabled the Google Sheets API for your project. You will also need to create a service account and provide the `GOOGLE_ACCOUNT_EMAIL` and `GOOGLE_ACCOUNT_PRIVATE_KEY` as environment variables.

You can find more information about how to set up a project and enable the Google Sheets API in the [Google Sheets API documentation](doc:https://developers.google.com/sheets/api/quickstart/nodejs).
