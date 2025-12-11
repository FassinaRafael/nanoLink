import { useState } from "react";
import { X, Save } from "lucide-react";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";

export function EditModal({ isOpen, onClose, link, onUpdate }) {
  const [newUrl, setNewUrl] = useState(link?.original_url || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Atualiza apenas a URL original no banco
      const { error } = await supabase
        .from("links")
        .update({ original_url: newUrl })
        .eq("id", link.id);

      if (error) throw error;

      toast.success("Link atualizado com sucesso!");
      onUpdate(); // Avisa o Dashboard para recarregar a lista
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Destino</h3>
        <p className="text-sm text-gray-500 mb-4">
          Você está alterando o destino do link curto: <br />
          <span className="font-mono text-blue-600 font-bold">
            {link.short_code}
          </span>
        </p>

        <form onSubmit={handleUpdate}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova URL Original
          </label>
          <input
            type="url"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none mb-6"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition"
          >
            <Save size={20} />
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
