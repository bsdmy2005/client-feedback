import { NextResponse } from "next/server"
import { runWeeklyTasks } from "@/lib/scheduledTasks"

export async function GET() {
  try {
    await runWeeklyTasks()
    return NextResponse.json({ success: true, message: "Weekly tasks completed successfully" })
  } catch (error) {
    console.error("Error running weekly tasks:", error)
    return NextResponse.json({ success: false, message: "Failed to run weekly tasks" }, { status: 500 })
  }
}
