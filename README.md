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
const client = new SheetsClient('<spreadsheetId>', '<sheetId>')

client.getHeader()
// ['Name', 'Date', 'Status', 'Link']

client.getRows()
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
const client = new SheetsClient('<spreadsheetId>', '<sheetId>')

client.setHeader(['Name', 'Date', 'Status', 'Link'])
client.updateRow(2, { Name: 'Send email', Date: '2023-03-02T13:07:00.000Z', Status: 'Done' })
client.addRow({ Name: 'Send email', Date: '2023-03-02T13:07:00.000Z', Status: 'Done' })
client.deleteRow(2)
client.deleteColumn(2)

// Multiple rows or columns are deleted in descending index order
client.deleteRows([2, 4])
client.deleteColumns([2, 4])

// Send request
client.commit()
```

### Clearing data

```typescript
const client = new SheetsClient('<spreadsheetId>', '<sheetId>')

client.clearSheet()
```

## Note

This package uses the `googleapis` library to interact with the Google Sheets API, so you will need to make sure that you have properly set up a project in the Google Cloud Console and enabled the Google Sheets API for your project. You will also need to create a service account and provide the `GOOGLE_ACCOUNT_EMAIL` and `GOOGLE_ACCOUNT_PRIVATE_KEY` as environment variables.

You can find more information about how to set up a project and enable the Google Sheets API in the [Google Sheets API documentation](doc:https://developers.google.com/sheets/api/quickstart/nodejs).
