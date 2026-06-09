import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const genre = request.nextUrl.searchParams.get("genre");

  const where = genre
    ? { genre: { equals: genre, mode: "insensitive" as const } }
    : {};

  const books = await prisma.book.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
    return apiError("Title is required", 400);
  }
  if (!body.genre || typeof body.genre !== "string" || body.genre.trim() === "") {
    return apiError("Genre is required", 400);
  }
  if (body.publishedYear === undefined || body.publishedYear === null) {
    return apiError("Published year is required", 400);
  }
  if (body.pages === undefined || body.pages === null) {
    return apiError("Pages is required", 400);
  }
  if (!body.authorId || typeof body.authorId !== "string" || body.authorId.trim() === "") {
    return apiError("Author ID is required", 400);
  }

  // Verify author exists
  const author = await prisma.author.findUnique({
    where: { id: body.authorId },
  });

  if (!author) {
    return apiError("Author not found", 404);
  }

  const book = await prisma.book.create({
    data: {
      title: body.title.trim(),
      genre: body.genre.trim(),
      publishedYear: Number(body.publishedYear),
      pages: Number(body.pages),
      authorId: body.authorId,
    },
    include: { author: true },
  });

  return NextResponse.json(book, { status: 201 });
}
