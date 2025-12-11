import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Link as LinkIcon,
  Copy,
  BarChart3,
  Trash2,
  ExternalLink,
  QrCode,
  Pencil,
  Globe,
  Search,
  Calendar,
  Moon,
  Sun,
} from "lucide-react";
import { generateCode } from "../utils/generateCode";
import { QrModal } from "../components/QrModal";
import { EditModal } from "../components/EditModal";
import { toast } from "sonner";

// --- MUDANÇA CRÍTICA PARA DEPLOY ---
// Se existir uma variável de ambiente (Vercel), usa ela. Senão, usa localhost.
// Nota: removemos a barra final se houver para evitar erros //url//
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [newUrl, setNewUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedQr, setSelectedQr] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const navigate = useNavigate();

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
    fetchLinks();
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const fetchLinks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return navigate("/");

    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Erro ao carregar links");
    else setLinks(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.info("Até logo!");
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const shortCode = customSlug.trim() ? customSlug.trim() : generateCode();

      let meta = { title: newUrl, icon: null };
      try {
        // Usa a API_URL dinâmica aqui
        const response = await fetch(`${API_URL}/api/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: newUrl }),
        });
        const scrapeData = await response.json();
        if (scrapeData.title) meta = scrapeData;
      } catch (err) {
        console.warn("Scraping falhou");
      }

      const { error } = await supabase.from("links").insert({
        original_url: newUrl,
        short_code: shortCode,
        user_id: user.id,
        meta_title: meta.title,
        favicon: meta.icon,
      });

      if (error) {
        if (error.code === "23505")
          throw new Error("Nome personalizado já existe!");
        throw error;
      }

      setNewUrl("");
      setCustomSlug("");
      fetchLinks();
      toast.success("Link criado!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    toast.promise(
      async () => {
        const { error } = await supabase.from("links").delete().eq("id", id);
        if (error) throw error;
        fetchLinks();
      },
      {
        loading: "Deletando...",
        success: "Link removido!",
        error: "Erro ao deletar",
      }
    );
  };

  const filteredLinks = links.filter(
    (link) =>
      link.original_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.meta_title &&
        link.meta_title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl">
          <LinkIcon /> NanoLink
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition font-medium"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Encurtar novo link
          </h2>
          <form
            onSubmit={handleShorten}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="url"
              required
              placeholder="Cole sua URL longa aqui..."
              className="flex-[2] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-400"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <div className="flex-1 relative">
              <span className="absolute left-3 top-3.5 text-gray-400 text-sm font-medium">
                /
              </span>
              <input
                type="text"
                placeholder="personalizado"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg pl-6 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-400"
                value={customSlug}
                onChange={(e) =>
                  setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))
                }
                maxLength={20}
              />
            </div>
            <button
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 shadow-md shadow-blue-500/20 whitespace-nowrap"
            >
              {creating ? "Processando..." : "Encurtar"}
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium uppercase text-sm tracking-wider">
              Seus Links
            </h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full font-bold">
              {filteredLinks.length}
            </span>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
            <LinkIcon
              className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
              size={48}
            />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Sua lista está vazia
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center hover:shadow-md dark:hover:border-gray-600 transition duration-200 gap-4"
              >
                <div className="overflow-hidden w-full sm:w-auto flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                    {link.favicon ? (
                      <img
                        src={link.favicon}
                        alt="icon"
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Globe
                        size={24}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <h4
                      className="font-semibold text-gray-800 dark:text-gray-100 truncate text-base mb-1"
                      title={link.meta_title}
                    >
                      {link.meta_title || link.original_url}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(link.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                      <span
                        className="truncate max-w-[200px]"
                        title={link.original_url}
                      >
                        {link.original_url}
                      </span>
                    </div>
                    {/* AQUI É A MUDANÇA VISUAL: Usa API_URL para exibir o link */}
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md w-fit">
                      <span className="truncate">
                        {API_URL.replace(/^https?:\/\//, "")}/{link.short_code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${API_URL}/${link.short_code}`
                          );
                          toast.success("Copiado!");
                        }}
                        className="text-blue-400 hover:text-blue-700 transition"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-xs font-bold mr-2">
                    <BarChart3 size={14} />
                    <span>{link.click_count}</span>
                  </div>
                  <button
                    onClick={() => setSelectedQr(link)}
                    className="action-btn text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2 rounded-lg transition"
                  >
                    <QrCode size={18} />
                  </button>
                  <button
                    onClick={() => setEditingLink(link)}
                    className="action-btn text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 p-2 rounded-lg transition"
                  >
                    <Pencil size={18} />
                  </button>
                  <a
                    href={`${API_URL}/${link.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="action-btn text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg transition"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="action-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <QrModal
          isOpen={!!selectedQr}
          onClose={() => setSelectedQr(null)}
          shortCode={selectedQr?.short_code}
          originalUrl={selectedQr?.original_url}
        />
        {editingLink && (
          <EditModal
            isOpen={!!editingLink}
            onClose={() => setEditingLink(null)}
            link={editingLink}
            onUpdate={fetchLinks}
          />
        )}
      </main>
    </div>
  );
}
