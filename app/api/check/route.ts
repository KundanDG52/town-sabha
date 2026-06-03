import { NextRequest, NextResponse } from "next/server";
import {
  getSheetData,
  getTodayColumnIndex,
  findUserById,
  isAlreadyMarked,
} from "@/lib/sheets";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param required" },
        { status: 400 }
      );
    }

    const rows = await getSheetData();
    const dateColIdx = await getTodayColumnIndex(rows);
    const found = findUserById(rows, userId);

    if (!found) {
      return NextResponse.json({ marked: false, exists: false });
    }

    return NextResponse.json({
      marked: isAlreadyMarked(found.row, dateColIdx),
      exists: true,
      name: found.row[1],
    });
  } catch (err) {
    console.error("[check]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
