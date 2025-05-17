import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = '11ty!A2:L';

const sheets = google.sheets({ version: 'v4', auth: API_KEY });

async function fetchSheetData() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    const header = ["Week", "Date", "Distance", "Duration", "Pace", "AvgHR", "Ascent", "Cadence", "Calories", "Weight", "BodyFat", "id"];

    const data = rows.map((row) => {
      const entry = {};
      header.forEach((col, idx) => {
        entry[col] = row[idx] || null;
      });
      return entry;
    });

    const outputPath = path.join('views', '_data', 'weekly.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`Fetched ${data.length} rows successfully to weekly.json!`);

  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

fetchSheetData();