import { X, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

export function QrModal({ isOpen, onClose, shortCode, originalUrl }) {
  const qrRef = useRef();

  if (!isOpen) return null;

  // URL completa do link curto
  // IMPORTANTE: Quando fizer deploy, troque localhost pelo seu domínio da Vercel
  const fullUrl = `http://localhost:3000/${shortCode}`;

  // Função para baixar a imagem
  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const url = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `qrcode-${shortCode}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-fade-in">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          QR Code do Link
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6 truncate px-4">
          {originalUrl}
        </p>

        {/* Área do QR Code */}
        <div
          ref={qrRef}
          className="flex justify-center mb-6 p-4 bg-white border-2 border-gray-100 rounded-xl"
        >
          <QRCodeCanvas
            value={fullUrl}
            size={200}
            level={"H"} // Alto nível de correção de erro
            includeMargin={true}
          />
        </div>

        {/* Botão Download */}
        <button
          onClick={downloadQRCode}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          <Download size={20} />
          Baixar Imagem (PNG)
        </button>
      </div>
    </div>
  );
}
