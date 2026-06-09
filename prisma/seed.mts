import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();

  const garcia = await prisma.author.create({
    data: {
      name: "Gabriel García Márquez",
      bio: "Escritor colombiano, Premio Nobel de Literatura 1982. Máximo exponente del realismo mágico.",
      books: {
        create: [
          { title: "Cien años de soledad", genre: "Realismo mágico", publishedYear: 1967, pages: 471 },
          { title: "El amor en los tiempos del cólera", genre: "Novela", publishedYear: 1985, pages: 368 },
          { title: "Crónica de una muerte anunciada", genre: "Novela", publishedYear: 1981, pages: 122 },
        ],
      },
    },
  });

  const borges = await prisma.author.create({
    data: {
      name: "Jorge Luis Borges",
      bio: "Escritor argentino, poeta y ensayista. Una de las figuras centrales de la literatura hispanoamericana del siglo XX.",
      books: {
        create: [
          { title: "Ficciones", genre: "Cuento", publishedYear: 1944, pages: 174 },
          { title: "El Aleph", genre: "Cuento", publishedYear: 1949, pages: 203 },
          { title: "El jardín de los senderos que se bifurcan", genre: "Cuento", publishedYear: 1941, pages: 64 },
        ],
      },
    },
  });

  const allende = await prisma.author.create({
    data: {
      name: "Isabel Allende",
      bio: "Escritora chilena, una de las novelistas latinoamericanas más leídas en el mundo.",
      books: {
        create: [
          { title: "La casa de los espíritus", genre: "Realismo mágico", publishedYear: 1982, pages: 433 },
          { title: "De amor y de sombra", genre: "Novela", publishedYear: 1984, pages: 271 },
          { title: "Eva Luna", genre: "Novela", publishedYear: 1987, pages: 283 },
        ],
      },
    },
  });

  const cortazar = await prisma.author.create({
    data: {
      name: "Julio Cortázar",
      bio: "Escritor argentino, innovador del cuento latinoamericano y autor de novelas experimentales.",
      books: {
        create: [
          { title: "Rayuela", genre: "Novela experimental", publishedYear: 1963, pages: 736 },
          { title: "Bestiario", genre: "Cuento", publishedYear: 1951, pages: 163 },
          { title: "Las armas secretas", genre: "Cuento", publishedYear: 1959, pages: 198 },
        ],
      },
    },
  });

  const vargas = await prisma.author.create({
    data: {
      name: "Mario Vargas Llosa",
      bio: "Escritor peruano, Premio Nobel de Literatura 2010. Figura clave del boom latinoamericano.",
      books: {
        create: [
          { title: "La ciudad y los perros", genre: "Novela", publishedYear: 1963, pages: 383 },
          { title: "La fiesta del Chivo", genre: "Novela histórica", publishedYear: 2000, pages: 517 },
          { title: "Pantaleón y las visitadoras", genre: "Novela", publishedYear: 1973, pages: 278 },
        ],
      },
    },
  });

  console.log("Autores creados:", [garcia.name, borges.name, allende.name, cortazar.name, vargas.name].join(", "));
  console.log("Total libros: 15");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
