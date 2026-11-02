import { validarBusca, formatarPeriodo, traduzirEpoca } from "./utils.js";
import { validarBusca, formatarPeriodo } from "./utils.js";

// Troque pelos dados de Project Settings > API (chave anon public).
const SUPABASE_URL = "https://xcretuspzsuucbgfuxnt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcmV0dXNwenN1dWNiZ2Z1eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NzU1NjYsImV4cCI6MjEwOTE1MTU2Nn0._ug9miB-22k7afUfO3Gd5-6MDHgGLvHfzUxbtOdBz2c";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const API = "https://api.openopus.org";

const $ = (id) => document.getElementById(id);
const msg = (t) => ($("msg").textContent = t);

function el(tag, texto, attrs = {}) {
  const e = document.createElement(tag);
  if (texto) e.textContent = texto;
  Object.assign(e, attrs);
  return e;
}
function botao(texto, fn, cls = "") {
  const b = el("button", texto, { type: "button", className: cls });
  b.addEventListener("click", fn);
  return b;
}
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Falha ao consultar a API de compositores.");
  return r.json();
}

// ---------- API externa (Open Opus) ----------
async function carregarDestaques() {
  try { mostrarCompositores((await getJSON(`${API}/composer/list/pop.json`)).composers); }
  catch (e) { msg(e.message); }
}
async function buscar(termo) {
  if (!validarBusca(termo)) return msg("Digite ao menos 2 letras.");
  msg("Buscando…");
  try {
    const data = await getJSON(`${API}/composer/list/search/${encodeURIComponent(termo.trim())}.json`);
    $("titulo-resultados").textContent = `Resultados para “${termo.trim()}”`;
    mostrarCompositores(data.composers || []);
    msg((data.composers || []).length ? "" : "Nenhum compositor encontrado.");
  } catch (e) { msg(e.message); }
}
function mostrarCompositores(lista) {
  const box = $("compositores");
  box.replaceChildren();
  lista.forEach((c) => {
    const card = el("article", "", { className: "card" });
    if (c.portrait) card.append(el("img", "", { src: c.portrait, alt: `Retrato de ${c.complete_name}`, loading: "lazy" }));
    card.append(el("h3", c.complete_name), el("small", `${formatarPeriodo(c.birth, c.death)} · ${traduzirEpoca(c.epoch)}`));
    const ac = el("div", "", { className: "acoes" });
    ac.append(
      botao("Ver obras", () => verObras(c)),
      botao("Favoritar", () => salvarFavorito("compositor", c.complete_name, "", { periodo: c.epoch }), "sec")
    );
    card.append(ac);
    box.append(card);
  });
}
async function verObras(c) {
  msg("Carregando obras…");
  try {
    const data = await getJSON(`${API}/work/list/composer/${c.id}/genre/Popular.json`);
    $("titulo-obras").textContent = `Obras de ${c.complete_name}`;
    const ul = $("obras");
    ul.replaceChildren();
    (data.works || []).forEach((w) => {
      const li = el("li");
      li.append(el("span", w.subtitle ? `${w.title} — ${w.subtitle}` : w.title),
        botao("Favoritar", () => salvarFavorito("obra", w.title, c.complete_name, { subtitulo: w.subtitle }), "sec"));
      ul.append(li);
    });
    if (!ul.children.length) ul.append(el("li", "Sem obras populares cadastradas.", { className: "vazio" }));
    $("sec-obras").hidden = false;
    $("sec-obras").scrollIntoView({ behavior: "smooth" });
    msg("");
  } catch (e) { msg(e.message); }
}

// ---------- Banco de dados (Supabase) ----------
async function salvarFavorito(tipo, nome, compositor, extra) {
  const { error } = await supabase.from("favoritos")
    .insert({ tipo, nome_item: nome, compositor, dados_extra: extra });
  if (error) { console.error(error); return msg("Não foi possível salvar. Veja o Console (F12)."); }
  msg("Adicionado aos favoritos."); listarFavoritos();
}
async function listarFavoritos() {
  const { data, error } = await supabase.from("favoritos").select("*").order("criado_em", { ascending: false });
  const ul = $("favoritos");
  ul.replaceChildren();
  if (error) { console.error(error); return msg("Não foi possível carregar os favoritos."); }
  if (!data.length) ul.append(el("li", "Você ainda não favoritou nada.", { className: "vazio" }));
  data.forEach((f) => {
    const li = el("li");
    const txt = el("span", `${f.nome_item}${f.compositor ? " — " + f.compositor : ""}${f.anotacao ? " · “" + f.anotacao + "”" : ""}`);
    const ac = el("div", "", { className: "acoes" });
    ac.append(botao("Anotar", () => anotar(f), "sec"), botao("Excluir", () => removerFavorito(f.id), "sec"));
    li.append(txt, ac);
    ul.append(li);
  });
}
async function anotar(f) {
  const texto = prompt("Sua anotação:", f.anotacao || "");
  if (texto === null) return;
  const { error } = await supabase.from("favoritos").update({ anotacao: texto }).eq("id", f.id);
  if (error) console.error(error);
  listarFavoritos();
}
async function removerFavorito(id) {
  const { error } = await supabase.from("favoritos").delete().eq("id", id);
  if (error) console.error(error);
  listarFavoritos();
}

document.addEventListener("DOMContentLoaded", () => {
  $("form-busca").addEventListener("submit", (e) => { e.preventDefault(); buscar($("busca").value); });
  carregarDestaques();
  listarFavoritos();
});
