import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";
import { computeAuthorStats } from "@/lib/author-stats";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) return apiError("Author not found", 404);

  const books = await prisma.book.findMany({ where: { authorId: id } });

  return NextResponse.json(computeAuthorStats(author, books));
}
