export interface BookStats {
  id: string;
  title: string;
  publishedYear: number;
  pages: number;
  genre: string;
}

export interface AuthorStats {
  authorId: string;
  authorName: string;
  totalBooks: number;
  firstBook: { title: string; year: number } | null;
  latestBook: { title: string; year: number } | null;
  averagePages: number;
  genres: string[];
  longestBook: { title: string; pages: number } | null;
  shortestBook: { title: string; pages: number } | null;
}

export function computeAuthorStats(
  author: { id: string; name: string },
  books: BookStats[]
): AuthorStats {
  if (books.length === 0) {
    return {
      authorId: author.id,
      authorName: author.name,
      totalBooks: 0,
      firstBook: null,
      latestBook: null,
      averagePages: 0,
      genres: [],
      longestBook: null,
      shortestBook: null,
    };
  }

  const totalBooks = books.length;
  const genres = [...new Set(books.map((b) => b.genre))];
  const averagePages = Math.round(books.reduce((s, b) => s + b.pages, 0) / totalBooks);

  const byYear = [...books].sort((a, b) => a.publishedYear - b.publishedYear);
  const byPages = [...books].sort((a, b) => b.pages - a.pages);

  return {
    authorId: author.id,
    authorName: author.name,
    totalBooks,
    firstBook: { title: byYear[0].title, year: byYear[0].publishedYear },
    latestBook: { title: byYear[totalBooks - 1].title, year: byYear[totalBooks - 1].publishedYear },
    averagePages,
    genres,
    longestBook: { title: byPages[0].title, pages: byPages[0].pages },
    shortestBook: { title: byPages[totalBooks - 1].title, pages: byPages[totalBooks - 1].pages },
  };
}
