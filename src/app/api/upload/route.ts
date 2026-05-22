import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Accept plain-text formats only
    const allowed = ["text/plain", "text/markdown", "text/csv", "application/json"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["txt", "md", "csv", "json"];

    if (!allowed.includes(file.type) && !allowedExt.includes(ext || "")) {
      return NextResponse.json(
        { error: "Only .txt, .md, .csv, .json files supported" },
        { status: 400 }
      );
    }

    let content = await file.text();
    if (content.length > 100_000) {
      content = content.slice(0, 100_000);
    }

    const doc = await prisma.uploadedDocument.create({
      data: {
        filename: file.name,
        content,
        mimeType: file.type || `text/${ext}`,
        size: file.size,
      },
    });

    return NextResponse.json({
      id: doc.id,
      filename: doc.filename,
      size: doc.size,
      preview: content.slice(0, 500),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const docs = await prisma.uploadedDocument.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({
      documents: docs.map((d) => ({
        id: d.id,
        filename: d.filename,
        size: d.size,
        preview: d.content.slice(0, 200),
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error("List documents error:", error);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}
