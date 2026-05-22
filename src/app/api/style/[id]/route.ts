import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await prisma.styleProfile.findUnique({ where: { id } });

    if (!profile) {
      return NextResponse.json({ error: "Style profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Get style profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.styleProfile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Style profile not found" }, { status: 404 });
    }

    await prisma.styleProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete style profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
