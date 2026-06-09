import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const includeBooks = request.nextUrl.searchParams.get("includeBooks") === "true";

  const authors = await prisma.author.findMany({
    include: { books: includeBooks },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(authors);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
    return apiError("Name is required", 400);
  }

  const author = await prisma.author.create({
    data: {
      name: body.name.trim(),
      bio: body.bio?.trim() || null,
    },
  });

  return NextResponse.json(author, { status: 201 });
}
