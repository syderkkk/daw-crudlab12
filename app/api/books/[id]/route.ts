import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!book) {
    return apiError("Book not found", 404);
  }

  return NextResponse.json(book);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim() === "")) {
    return apiError("Title cannot be empty", 400);
  }
  if (body.genre !== undefined && (typeof body.genre !== "string" || body.genre.trim() === "")) {
    return apiError("Genre cannot be empty", 400);
  }

  // If authorId is being changed, verify the new author exists
  if (body.authorId) {
    const author = await prisma.author.findUnique({
      where: { id: body.authorId },
    });
    if (!author) {
      return apiError("Author not found", 404);
    }
  }

  try {
    const book = await prisma.book.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.genre !== undefined && { genre: body.genre.trim() }),
        ...(body.publishedYear !== undefined && { publishedYear: Number(body.publishedYear) }),
        ...(body.pages !== undefined && { pages: Number(body.pages) }),
        ...(body.authorId !== undefined && { authorId: body.authorId }),
      },
      include: { author: true },
    });

    return NextResponse.json(book);
  } catch {
    return apiError("Book not found", 404);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const book = await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json(book);
  } catch {
    return apiError("Book not found", 404);
  }
}
