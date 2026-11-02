// Funcoes puras (faceis de testar) usadas pelo app e pelos testes automatizados.
export function validarBusca(texto) {
  return typeof texto === "string" && texto.trim().length >= 2;
}

export function formatarNome(nome) {
  if (typeof nome !== "string") return "";
  return nome.trim().toLowerCase().split(/\s+/).filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export function formatarPeriodo(nascimento, morte) {
  const ano = (d) => (d ? String(d).slice(0, 4) : "");
  if (!ano(nascimento)) return "";
  return ano(morte) ? `${ano(nascimento)}–${ano(morte)}` : `${ano(nascimento)}–`;
}
