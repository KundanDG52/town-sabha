import { NextRequest, NextResponse } from "next/server";
import {
  getSheetData,
  getTodayColumnIndex,
  findUserByMobile,
  findUserById,
  getNextUserId,
  createUser,
  markAttendance,
  isAlreadyMarked,
} from "@/lib/sheets";
import type { AttendRequest, AttendResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<AttendResponse>> {
  try {
    const body: AttendRequest = await req.json();

    // getSheetData auto-creates the header row if the sheet is empty
    const rows = await getSheetData();
    const dateColIdx = await getTodayColumnIndex(rows);

    if (body.userId) {
      const found = findUserById(rows, body.userId);
      if (!found) {
        // userId from localStorage no longer exists — treat as new
        return NextResponse.json(
          { status: "error", message: "User not found" },
          { status: 404 }
        );
      }
      const { row, rowIndex } = found;
      const name = row[1];

      if (isAlreadyMarked(row, dateColIdx)) {
        return NextResponse.json({ status: "duplicate", name });
      }

      await markAttendance(rowIndex, dateColIdx);
      return NextResponse.json({ status: "marked", name });
    }

    if (body.name && body.mobile) {
      const existing = findUserByMobile(rows, body.mobile);

      if (existing) {
        const { row, rowIndex } = existing;
        const name = row[1];
        const userId = row[0];

        if (isAlreadyMarked(row, dateColIdx)) {
          return NextResponse.json({ status: "duplicate", name, userId });
        }

        await markAttendance(rowIndex, dateColIdx);
        return NextResponse.json({ status: "marked", name, userId });
      }

      // Brand new user
      const userId = getNextUserId(rows);
      await createUser(body.name, body.mobile, userId, dateColIdx);
      return NextResponse.json({ status: "registered", userId, name: body.name });
    }

    return NextResponse.json(
      { status: "error", message: "Provide either userId or name+mobile" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[attend] error:", err);
    return NextResponse.json(
      { status: "error", message: String(err) },
      { status: 500 }
    );
  }
}
