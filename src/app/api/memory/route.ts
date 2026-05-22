import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export async function GET() {
  const memories = await prisma.userMemory.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ memories });
}

const memorySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  category: z.enum(["preference", "style", "topic", "feedback"]).default("preference"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = memorySchema.parse(body);

    const memory = await prisma.userMemory.upsert({
      where: { key: parsed.key },
      update: { value: parsed.value, category: parsed.category },
      create: { key: parsed.key, value: parsed.value, category: parsed.category },
    });

    return NextResponse.json({ memory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Memory error:", error);
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const key = searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Key required" }, { status: 400 });
  }
  await prisma.userMemory.delete({ where: { key } }).catch(() => {});
  return NextResponse.json({ deleted: true });
}
