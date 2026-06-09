import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/app/components/nav";
import { StatCard } from "@/app/components/stat-card";
import { PlusIcon, TrashIcon, UsersIcon } from "@/app/components/icons";

export const dynamic = "force-dynamic";

async function crearAutor(formData: FormData) {
  "use server";
  const nombre = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  if (!nombre?.trim()) return;
  await prisma.author.create({ data: { name: nombre.trim(), bio: bio?.trim() || null } });
  revalidatePath("/");
}

async function eliminarAutor(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.author.delete({ where: { id } });
  revalidatePath("/");
}

export default async function PaginaPrincipal() {
  const [autores, totalLibros, generos] = await Promise.all([
    prisma.author.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.count(),
    prisma.book.findMany({ select: { genre: true }, distinct: ["genre"] }),
  ]);

  return (
    <div className="min-h-screen">
      <Nav action={{ href: "/books", label: "Ver catálogo" }} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Biblioteca</h1>
          <p className="text-sm text-slate-500 mt-1">Panel de gestión del catálogo</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Autores" value={autores.length} />
          <StatCard label="Libros" value={totalLibros} />
          <StatCard label="Géneros" value={generos.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Autores · {autores.length}
              </h2>
            </div>

            {autores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
                <p className="text-slate-400 text-sm">Sin autores. Añade uno desde el panel.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {autores.map((autor) => (
                  <div
                    key={autor.id}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-indigo-600">
                          {autor.name.charAt(0)}
                        </span>
                      </div>
                      <form action={eliminarAutor}>
                        <input type="hidden" name="id" value={autor.id} />
                        <button
                          type="submit"
                          title="Eliminar autor"
                          className="rounded-xl p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:scale-[0.97] transition-all duration-150 opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 leading-snug">{autor.name}</h3>
                      {autor.bio && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {autor.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                      <span className="text-xs text-slate-400 tabular-nums">
                        {autor._count.books} {autor._count.books === 1 ? "libro" : "libros"}
                      </span>
                      <Link
                        href={`/authors/${autor.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-20 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <PlusIcon className="w-4 h-4 text-indigo-500" />
                  Nuevo autor
                </h2>
                <p className="text-xs text-slate-400 mt-1">Añade un autor al catálogo</p>
              </div>

              <form action={crearAutor} className="space-y-3">
                <input
                  name="name"
                  placeholder="Nombre completo"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all duration-150"
                />
                <textarea
                  name="bio"
                  placeholder="Biografía (opcional)"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all duration-150 resize-none"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150"
                >
                  <PlusIcon className="w-4 h-4" />
                  Añadir autor
                </button>
              </form>
            </div>

            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
              <p className="text-xs font-medium text-indigo-700 mb-2">Catálogo completo</p>
              <p className="text-xs text-indigo-500 mb-3">
                Busca, filtra y gestiona todos los libros del sistema.
              </p>
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
              >
                Ir al catálogo →
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
