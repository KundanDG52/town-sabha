import { google } from "googleapis";

const HEADER_ROW = ["User ID", "Name", "Mobile"];

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

// Cache the first sheet name so we only fetch metadata once per server instance
let cachedSheetName: string | null = null;

async function getFirstSheetName(): Promise<string> {
  if (cachedSheetName) return cachedSheetName;
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
  });
  const name = meta.data.sheets?.[0]?.properties?.title ?? "Sheet1";
  cachedSheetName = name;
  return name;
}

function getTodayString(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function columnLetter(index: number): string {
  let letter = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

export async function getSheetData(): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1:ZZ5000`,
  });

  const rows = (res.data.values as string[][]) ?? [];

  if (rows.length === 0) {
    // Auto-create header row on a blank sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A1:C1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADER_ROW] },
    });
    return [HEADER_ROW];
  }

  return rows;
}

export async function getTodayColumnIndex(rows: string[][]): Promise<number> {
  const today = getTodayString();
  const headers = rows[0] ?? HEADER_ROW;

  const existingIdx = headers.indexOf(today);
  if (existingIdx !== -1) return existingIdx;

  const newColIdx = Math.max(headers.length, 3);
  const colLetter = columnLetter(newColIdx);
  const sheetName = await getFirstSheetName();
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!${colLetter}1`,
    valueInputOption: "RAW",
    requestBody: { values: [[today]] },
  });
  return newColIdx;
}

export function findUserByMobile(
  rows: string[][],
  mobile: string
): { row: string[]; rowIndex: number } | null {
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[2] === mobile) return { row: rows[i], rowIndex: i };
  }
  return null;
}

export function findUserById(
  rows: string[][],
  userId: string
): { row: string[]; rowIndex: number } | null {
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[0] === userId) return { row: rows[i], rowIndex: i };
  }
  return null;
}

export function getNextUserId(rows: string[][]): string {
  const userRows = rows.slice(1).filter((r) => r?.[0]?.startsWith("USR_"));
  const num = userRows.length + 1;
  return `USR_${String(num).padStart(3, "0")}`;
}

export async function createUser(
  name: string,
  mobile: string,
  userId: string,
  dateColIdx: number
): Promise<void> {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName();

  const row: string[] = Array(dateColIdx + 1).fill("");
  row[0] = userId;
  row[1] = name;
  row[2] = mobile;
  row[dateColIdx] = "P";

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export async function markAttendance(
  rowIndex: number,
  dateColIdx: number
): Promise<void> {
  const sheets = await getSheetsClient();
  const sheetName = await getFirstSheetName();
  const colLetter = columnLetter(dateColIdx);
  const sheetRow = rowIndex + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!${colLetter}${sheetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [["P"]] },
  });
}

export function isAlreadyMarked(row: string[], dateColIdx: number): boolean {
  return row?.[dateColIdx] === "P";
}
