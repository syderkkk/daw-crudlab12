import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";
import { Prisma } from "@/app/generated/prisma/client";

const ALLOWED_SORT_FIELDS = ["title", "publishedYear", "createdAt"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const search = sp.get("search")?.trim() || undefined;
  const genre = sp.get("genre")?.trim() || undefined;
  const authorName = sp.get("authorName")?.trim() || undefined;

  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 10));

  const sortByParam = sp.get("sortBy") || "createdAt";
  const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(sortByParam as SortField)
    ? (sortByParam as SortField)
    : "createdAt";

  const orderParam = sp.get("order") || "desc";
  const order = orderParam === "asc" ? "asc" : "desc";

  // Build dynamic AND conditions
  const conditions: Prisma.BookWhereInput[] = [];

  if (search) {
    conditions.push({ title: { contains: search, mode: "insensitive" } });
  }
  if (genre) {
    conditions.push({ genre: { equals: genre, mode: "insensitive" } });
  }
  if (authorName) {
    conditions.push({
      author: { name: { contains: authorName, mode: "insensitive" } },
    });
  }

  const where: Prisma.BookWhereInput = conditions.length > 0 ? { AND: conditions } : {};

  try {
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { author: true },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      books,
      total,
      pages,
      page,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    console.error("Book search error:", err);
    return apiError("Failed to search books", 500);
  }
}
