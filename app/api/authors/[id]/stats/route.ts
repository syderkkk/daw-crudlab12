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
  });

  if (!author) {
    return apiError("Author not found", 404);
  }

  try {
    const books = await prisma.book.findMany({
      where: { authorId: id },
      orderBy: { pages: "desc" },
    });

    if (books.length === 0) {
      return NextResponse.json({
        bookCount: 0,
        firstBookYear: null,
        lastBookYear: null,
        avgPublishedYear: null,
        genres: [],
        longestBook: null,
        shortestBook: null,
      });
    }

    const bookCount = books.length;
    const years = books.map((b) => b.publishedYear);
    const firstBookYear = Math.min(...years);
    const lastBookYear = Math.max(...years);
    const avgPublishedYear = Math.round(years.reduce((sum, y) => sum + y, 0) / bookCount);
    const genres = [...new Set(books.map((b) => b.genre))];

    // Already sorted by pages desc
    const longestBook = books[0];
    const shortestBook = books[books.length - 1];

    return NextResponse.json({
      bookCount,
      firstBookYear,
      lastBookYear,
      avgPublishedYear,
      genres,
      longestBook,
      shortestBook,
    });
  } catch (err) {
    console.error("Author stats error:", err);
    return apiError("Failed to compute author stats", 500);
  }
}
