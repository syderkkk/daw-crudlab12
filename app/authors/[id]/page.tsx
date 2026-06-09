import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/app/components/nav";
import { PlusIcon, TrashIcon, ChartBarIcon } from "@/app/components/icons";

export const dynamic = "force-dynamic";

const campo =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all duration-150";

async function actualizarAutor(id: string, formData: FormData) {
  "use server";
  const nombre = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  if (!nombre?.trim()) return;
  await prisma.author.update({
    where: { id },
    data: { name: nombre.trim(), bio: bio?.trim() || null },
  });
  revalidatePath(`/authors/${id}`);
}

async function agregarLibro(autorId: string, formData: FormData) {
  "use server";
  const titulo = formData.get("title") as string;
  const genero = formData.get("genre") as string;
  const anio = Number(formData.get("publishedYear"));
  const paginas = Number(formData.get("pages"));
  if (!titulo?.trim() || !genero?.trim() || !anio || !paginas) return;
  await prisma.book.create({
    data: { title: titulo.trim(), genre: genero.trim(), publishedYear: anio, pages: paginas, authorId: autorId },
  });
  revalidatePath(`/authors/${autorId}`);
}

async function eliminarLibro(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const autorId = formData.get("authorId") as string;
  if (!id) return;
  await prisma.book.delete({ where: { id } });
  revalidatePath(`/authors/${autorId}`);
}

export default async function PaginaAutor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const autor = await prisma.author.findUnique({
    where: { id },
    include: { books: { orderBy: { publishedYear: "desc" } } },
  });
  if (!autor) notFound();

  const libros = autor.books;
  const total = libros.length;
  const anios = libros.map((b) => b.publishedYear);
  const promPaginas = total > 0 ? Math.round(libros.reduce((s, b) => s + b.pages, 0) / total) : 0;
  const generos = [...new Set(libros.map((b) => b.genre))];
  const masLargo = total > 0 ? libros.reduce((a, b) => (a.pages >= b.pages ? a : b)) : null;
  const masCorto = total > 0 ? libros.reduce((a, b) => (a.pages <= b.pages ? a : b)) : null;

  return (
    <div className="min-h-screen">
      <Nav back={{ href: "/", label: "Biblioteca" }} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-indigo-600">{autor.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{autor.name}</h1>
              {autor.bio && (
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-2xl">{autor.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs font-medium text-slate-400">
                  <span className="text-slate-700 font-semibold">{total}</span> {total === 1 ? "libro" : "libros"}
                </span>
                {generos.length > 0 && (
                  <span className="text-xs font-medium text-slate-400">
                    <span className="text-slate-700 font-semibold">{generos.length}</span> {generos.length === 1 ? "género" : "géneros"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

          <aside className="lg:sticky lg:top-20 space-y-4">

            {total > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ChartBarIcon className="w-3.5 h-3.5" />
                  Estadísticas
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Libros", value: total },
                    { label: "Pág. prom.", value: promPaginas },
                    { label: "Primer año", value: Math.min(...anios) },
                    { label: "Último año", value: Math.max(...anios) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-slate-900 tabular-nums">{value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{label}</p>
                    </div>
                  ))}
                </div>

                {generos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Géneros</p>
                    <div className="flex flex-wrap gap-1.5">
                      {generos.map((g) => (
                        <span key={g} className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {masLargo && masCorto && total > 1 && (
                  <div className="space-y-2 pt-1 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Más largo</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{masLargo.title}</p>
                      <p className="text-xs text-slate-400">{masLargo.pages} páginas</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Más corto</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{masCorto.title}</p>
                      <p className="text-xs text-slate-400">{masCorto.pages} páginas</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Editar autor
              </h2>
              <form action={actualizarAutor.bind(null, id)} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Nombre</label>
                  <input name="name" defaultValue={autor.name} required className={campo} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Biografía</label>
                  <textarea
                    name="bio"
                    defaultValue={autor.bio || ""}
                    placeholder="Biografía (opcional)"
                    rows={4}
                    className={`${campo} resize-none`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 active:scale-[0.97] transition-all duration-150"
                >
                  Guardar cambios
                </button>
              </form>
            </div>
          </aside>

          <div className="space-y-4">

            <details className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <summary className="flex items-center gap-2 px-5 py-4 cursor-pointer list-none select-none hover:bg-slate-50 transition-colors duration-150">
                <PlusIcon className="w-4 h-4 text-indigo-500 group-open:rotate-45 transition-transform duration-200" />
                <span className="text-sm font-semibold text-slate-700">Añadir nuevo libro</span>
                <span className="ml-auto text-xs text-slate-400 group-open:hidden">Expandir</span>
                <span className="ml-auto text-xs text-slate-400 hidden group-open:block">Cerrar</span>
              </summary>
              <div className="px-5 pb-5 border-t border-slate-50">
                <form action={agregarLibro.bind(null, id)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Título</label>
                    <input name="title" placeholder="Título del libro" required className={campo} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Género</label>
                    <input name="genre" placeholder="Ej. Novela, Cuento..." required className={campo} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Año de publicación</label>
                    <input name="publishedYear" placeholder="Ej. 1967" type="number" required className={campo} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Páginas</label>
                    <input name="pages" placeholder="Número de páginas" type="number" required className={campo} />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150"
                    >
                      Añadir libro
                    </button>
                  </div>
                </form>
              </div>
            </details>

            <div className="space-y-3">
              <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Libros publicados · {total}
              </h2>

              {libros.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
                  <p className="text-slate-400 text-sm">Sin libros. Añade uno con el panel de arriba.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {libros.map((libro, i) => (
                    <div
                      key={libro.id}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] px-5 py-4 flex items-center gap-4"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-400 tabular-nums">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{libro.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {libro.genre} · {libro.publishedYear} · {libro.pages} páginas
                        </p>
                      </div>
                      <form action={eliminarLibro} className="shrink-0">
                        <input type="hidden" name="id" value={libro.id} />
                        <input type="hidden" name="authorId" value={id} />
                        <button
                          type="submit"
                          title="Eliminar libro"
                          className="rounded-xl p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:scale-[0.97] transition-all duration-150 opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
