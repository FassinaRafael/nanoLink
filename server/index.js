require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio"); // <--- O leitor de HTML
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// --- NOVA ROTA: SCRAPING DE METADADOS ---
// O Frontend manda a URL, o Backend devolve Título e Ícone
app.post("/api/scrape", async (req, res) => {
  const { url } = req.body;

  try {
    // 1. Acessa o site
    const { data } = await axios.get(url, {
      timeout: 5000, // Desiste se demorar mais de 5s
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NanoLinkBot/1.0)" },
    });

    // 2. Carrega o HTML
    const $ = cheerio.load(data);

    // 3. Busca o Título
    const title =
      $("title").text() ||
      $('meta[property="og:title"]').attr("content") ||
      url;

    // 4. Busca o Favicon (Ícone)
    let icon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href");

    // Tratamento para ícones com caminho relativo (ex: /favicon.ico -> google.com/favicon.ico)
    if (icon && !icon.startsWith("http")) {
      const urlObj = new URL(url);
      icon = `${urlObj.protocol}//${urlObj.host}${
        icon.startsWith("/") ? "" : "/"
      }${icon}`;
    }

    res.json({ title: title.trim(), icon });
  } catch (error) {
    console.error("Erro no scraping:", error.message);
    // Se der erro, retorna vazio, mas não quebra o app
    res.json({ title: url, icon: null });
  }
});

// --- Rota de Redirecionamento (Mantida) ---
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const { data, error } = await supabase
    .from("links")
    .select("id, original_url, click_count")
    .eq("short_code", code)
    .single();

  if (error || !data) {
    return res.status(404).send("<h1>Link não encontrado</h1>");
  }

  // Atualiza contador em background
  supabase
    .from("links")
    .update({ click_count: data.click_count + 1 })
    .eq("id", data.id)
    .then(({ error }) => {
      if (error) console.log(error);
    });

  res.redirect(data.original_url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
