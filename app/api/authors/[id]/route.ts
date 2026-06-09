import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const author = await prisma.author.findUnique({
    where: { id },
    include: { books: true },
  });

  if (!author) {
    return apiError("Author not found", 404);
  }

  return NextResponse.json(author);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.name !== undefined && (typeof body.name !== "string" || body.name.trim() === "")) {
    return apiError("Name cannot be empty", 400);
  }

  try {
    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.bio !== undefined && { bio: body.bio?.trim() || null }),
      },
    });

    return NextResponse.json(author);
  } catch {
    return apiError("Author not found", 404);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const author = await prisma.author.delete({
      where: { id },
    });

    return NextResponse.json(author);
  } catch {
    return apiError("Author not found", 404);
  }
}
