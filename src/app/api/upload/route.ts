import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Accept text files, markdown, PDF names
    const allowed = [
      "text/plain", "text/markdown", "text/csv",
      "application/pdf",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["txt", "md", "csv", "json", "pdf"];

    if (!allowed.includes(file.type) && !allowedExt.includes(ext || "")) {
      return NextResponse.json(
        { error: "Only .txt, .md, .csv, .json files supported" },
        { status: 400 }
      );
    }

    // For text-based files, read content directly
    let content: string;
    if (file.type === "application/pdf") {
      // PDF — read as text (best effort)
      const buffer = Buffer.from(await file.arrayBuffer());
      content = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
    } else {
      content = await file.text();
    }

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
}
