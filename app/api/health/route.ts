import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}
