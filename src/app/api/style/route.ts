import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createProfileSchema = z.object({
  name: z.string().min(1),
  samples: z.array(z.string()).min(1),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProfileSchema.parse(body);

    const profile = await prisma.styleProfile.create({
      data: {
        name: parsed.name,
        samples: parsed.samples,
        description: parsed.description,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Create style profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const profiles = await prisma.styleProfile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("List style profiles error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
