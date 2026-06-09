"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Nav } from "@/app/components/nav";
import {
  PlusIcon,
  TrashIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  ChartBarIcon,
  PencilIcon,
} from "@/app/components/icons";

interface Autor { id: string; name: string }
interface Libro {
  id: string;
  title: string;
  genre: string;
  publishedYear: number;
  pages: number;
  author: Autor;
}
interface RespuestaBusqueda {
  data: Libro[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const campo = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all duration-150";
const libroVacio = { title: "", genre: "", publishedYear: "", pages: "", authorId: "" };

const coloresBorde = [
  "border-l-violet-400", "border-l-indigo-400", "border-l-sky-400",
  "border-l-emerald-400", "border-l-amber-500", "border-l-rose-400",
  "border-l-pink-400", "border-l-teal-400",
];
const coloresBadge = [
  "bg-violet-50 text-violet-700 border-violet-100",
  "bg-indigo-50 text-indigo-700 border-indigo-100",
  "bg-sky-50 text-sky-700 border-sky-100",
  "bg-emerald-50 text-emerald-700 border-emerald-100",
  "bg-amber-50 text-amber-700 border-amber-100",
  "bg-rose-50 text-rose-700 border-rose-100",
  "bg-pink-50 text-pink-700 border-pink-100",
  "bg-teal-50 text-teal-700 border-teal-100",
];

function colorIdx(genero: string) {
  return genero.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % coloresBorde.length;
}

function SeccionFiltro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{titulo}</p>
      {children}
    </div>
  );
}

export default function PaginaLibros() {
  const [data, setData] = useState<RespuestaBusqueda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [genero, setGenero] = useState("");
  const [autorId, setAutorId] = useState("");
  const [ordenPor, setOrdenPor] = useState("createdAt");
  const [direccion, setDireccion] = useState<"asc" | "desc">("desc");
  const [pagina, setPagina] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevoLibro, setNuevoLibro] = useState(libroVacio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [datosEdicion, setDatosEdicion] = useState({ title: "", genre: "", publishedYear: "", pages: "" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/authors").then((r) => r.json()).then(setAutores).catch(() => {});
  }, []);

  const autorNombreFiltro = autorId
    ? autores.find((a) => a.id === autorId)?.name ?? ""
    : "";

  const buscarLibros = useCallback(async () => {
    setCargando(true);
    const params = new URLSearchParams();
    if (busqueda) params.set("search", busqueda);
    if (genero) params.set("genre", genero);
    if (autorNombreFiltro) params.set("authorName", autorNombreFiltro);
    params.set("page", String(pagina));
    params.set("limit", "12");
    params.set("sortBy", ordenPor);
    params.set("order", direccion);
    try {
      const json: RespuestaBusqueda = await fetch(`/api/books/search?${params}`).then((r) => r.json());
      setData(json);
      setGeneros((prev) => {
        const s = new Set(prev);
        json.data.forEach((b) => s.add(b.genre));
        return [...s].sort();
      });
    } catch {
    } finally {
      setCargando(false);
    }
  }, [busqueda, genero, autorNombreFiltro, pagina, ordenPor, direccion]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(buscarLibros, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [buscarLibros]);

  useEffect(() => { setPagina(1); }, [busqueda, genero, autorId, ordenPor, direccion]);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoLibro,
          publishedYear: Number(nuevoLibro.publishedYear),
          pages: Number(nuevoLibro.pages),
        }),
      });
      if (res.ok) {
        setNuevoLibro(libroVacio);
        setMostrarFormulario(false);
        buscarLibros();
      }
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(id: string) {
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    buscarLibros();
  }

  function iniciarEdicion(libro: Libro) {
    setEditandoId(libro.id);
    setDatosEdicion({
      title: libro.title,
      genre: libro.genre,
      publishedYear: String(libro.publishedYear),
      pages: String(libro.pages),
    });
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoId) return;
    await fetch(`/api/books/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...datosEdicion,
        publishedYear: Number(datosEdicion.publishedYear),
        pages: Number(datosEdicion.pages),
      }),
    });
    setEditandoId(null);
    buscarLibros();
  }

  const hayFiltros = busqueda || genero || autorId;

  return (
    <div className="min-h-screen">
      <Nav back={{ href: "/", label: "Biblioteca" }} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Catálogo</h1>
            <p className="text-sm text-slate-500 mt-1">
              {data ? `${data.pagination.total} ${data.pagination.total === 1 ? "libro" : "libros"} en total` : "Cargando..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`lg:hidden inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${mostrarFiltros ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <ChartBarIcon className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${mostrarFormulario ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
              {mostrarFormulario ? <XMarkIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              {mostrarFormulario ? "Cancelar" : "Nuevo libro"}
            </button>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${mostrarFormulario ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"}`}>
          <form
            onSubmit={handleCrear}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Título</label>
              <input placeholder="Título del libro" required value={nuevoLibro.title} onChange={(e) => setNuevoLibro({ ...nuevoLibro, title: e.target.value })} className={campo} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Género</label>
              <input placeholder="Ej. Novela, Cuento..." required value={nuevoLibro.genre} onChange={(e) => setNuevoLibro({ ...nuevoLibro, genre: e.target.value })} className={campo} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Año de publicación</label>
              <input placeholder="Ej. 1967" type="number" required value={nuevoLibro.publishedYear} onChange={(e) => setNuevoLibro({ ...nuevoLibro, publishedYear: e.target.value })} className={campo} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Páginas</label>
              <input placeholder="Número de páginas" type="number" required value={nuevoLibro.pages} onChange={(e) => setNuevoLibro({ ...nuevoLibro, pages: e.target.value })} className={campo} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Autor</label>
              <select required value={nuevoLibro.authorId} onChange={(e) => setNuevoLibro({ ...nuevoLibro, authorId: e.target.value })} className={campo}>
                <option value="">Selecciona un autor</option>
                {autores.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={creando} className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150 disabled:opacity-50">
                {creando ? "Creando..." : "Crear libro"}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] gap-6 items-start">

          <aside className={`space-y-4 lg:sticky lg:top-20 ${mostrarFiltros ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">

              <SeccionFiltro titulo="Buscar">
                <div className="relative">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    placeholder="Título del libro..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={`${campo} pl-10`}
                  />
                </div>
              </SeccionFiltro>

              <div className="border-t border-slate-50" />

              <SeccionFiltro titulo="Género">
                <select value={genero} onChange={(e) => setGenero(e.target.value)} className={campo}>
                  <option value="">Todos los géneros</option>
                  {generos.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </SeccionFiltro>

              <SeccionFiltro titulo="Autor">
                <select value={autorId} onChange={(e) => setAutorId(e.target.value)} className={campo}>
                  <option value="">Todos los autores</option>
                  {autores.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </SeccionFiltro>

              <div className="border-t border-slate-50" />

              <SeccionFiltro titulo="Ordenar por">
                <select value={ordenPor} onChange={(e) => setOrdenPor(e.target.value)} className={campo}>
                  <option value="createdAt">Recientes</option>
                  <option value="title">Título</option>
                  <option value="publishedYear">Año de publicación</option>
                </select>
              </SeccionFiltro>

              <SeccionFiltro titulo="Dirección">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDireccion("desc")}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${direccion === "desc" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <ArrowDownIcon className="w-3.5 h-3.5 mx-auto" />
                    <span className="mt-0.5 block">Desc.</span>
                  </button>
                  <button
                    onClick={() => setDireccion("asc")}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${direccion === "asc" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <ArrowUpIcon className="w-3.5 h-3.5 mx-auto" />
                    <span className="mt-0.5 block">Asc.</span>
                  </button>
                </div>
              </SeccionFiltro>

              {hayFiltros && (
                <>
                  <div className="border-t border-slate-50" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Filtros activos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {busqueda && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {busqueda}
                          <button onClick={() => setBusqueda("")} className="hover:text-indigo-900"><XMarkIcon className="w-3 h-3" /></button>
                        </span>
                      )}
                      {genero && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {genero}
                          <button onClick={() => setGenero("")} className="hover:text-indigo-900"><XMarkIcon className="w-3 h-3" /></button>
                        </span>
                      )}
                      {autorId && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {autores.find((a) => a.id === autorId)?.name}
                          <button onClick={() => setAutorId("")} className="hover:text-indigo-900"><XMarkIcon className="w-3 h-3" /></button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setBusqueda(""); setGenero(""); setAutorId(""); }}
                      className="text-xs text-slate-400 hover:text-slate-700 transition-colors duration-150"
                    >
                      Limpiar todo
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>

          <div className="min-w-0 space-y-4">

            {data && !cargando && (
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">
                  {data.pagination.total} resultado{data.pagination.total !== 1 ? "s" : ""}
                  {data.pagination.totalPages > 1 && ` · Página ${data.pagination.page} de ${data.pagination.totalPages}`}
                </p>
              </div>
            )}

            {cargando && (
              <div className="flex flex-col items-center py-24 gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                <p className="text-sm text-slate-400">Cargando libros...</p>
              </div>
            )}

            {!cargando && data?.data.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 py-24 text-center">
                <SearchIcon className="w-9 h-9 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Sin resultados</p>
                <p className="text-slate-400 text-xs mt-1">Prueba con otros términos de búsqueda</p>
              </div>
            )}

            {!cargando && data && data.data.length > 0 && (
              <div className="space-y-2">
                {data.data.map((libro) => {
                  const idx = colorIdx(libro.genre);
                  const editando = editandoId === libro.id;
                  return (
                    <div
                      key={libro.id}
                      className={`bg-white rounded-2xl border border-slate-100 border-l-[3px] ${coloresBorde[idx]} shadow-sm transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${editando ? "shadow-md" : "group hover:shadow-md hover:-translate-y-0.5"}`}
                    >
                      {editando ? (
                        <form onSubmit={handleEditar} className="px-5 py-4 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Título</label>
                            <input required value={datosEdicion.title} onChange={(e) => setDatosEdicion({ ...datosEdicion, title: e.target.value })} className={campo} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Género</label>
                            <input required value={datosEdicion.genre} onChange={(e) => setDatosEdicion({ ...datosEdicion, genre: e.target.value })} className={campo} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Año</label>
                            <input type="number" required value={datosEdicion.publishedYear} onChange={(e) => setDatosEdicion({ ...datosEdicion, publishedYear: e.target.value })} className={campo} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Páginas</label>
                            <input type="number" required value={datosEdicion.pages} onChange={(e) => setDatosEdicion({ ...datosEdicion, pages: e.target.value })} className={campo} />
                          </div>
                          <div className="col-span-2 flex gap-2">
                            <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 active:scale-[0.97] transition-all duration-150">
                              Guardar
                            </button>
                            <button type="button" onClick={() => setEditandoId(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-[0.97] transition-all duration-150">
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="px-5 py-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-900 truncate">{libro.title}</h3>
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${coloresBadge[idx]}`}>
                                {libro.genre}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5">
                              <span className="text-slate-500 font-medium">{libro.author.name}</span>
                              {" · "}{libro.publishedYear}{" · "}{libro.pages} páginas
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => iniciarEdicion(libro)}
                              title="Editar libro"
                              className="rounded-xl p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 active:scale-[0.97] transition-all duration-150"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminar(libro.id)}
                              title="Eliminar libro"
                              className="rounded-xl p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:scale-[0.97] transition-all duration-150"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={!data.pagination.hasPrev}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.97] transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(data.pagination.totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPagina(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${p === data.pagination.page ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPagina((p) => p + 1)}
                  disabled={!data.pagination.hasNext}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.97] transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
