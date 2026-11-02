import { test, expect } from "vitest";
import { validarBusca, formatarNome, formatarPeriodo } from "./utils.js";

test("rejeita busca vazia ou curta demais", () => {
  expect(validarBusca("")).toBe(false);
  expect(validarBusca(" a ")).toBe(false);
});
test("aceita busca valida", () => {
  expect(validarBusca("bach")).toBe(true);
});
test("formata nome com iniciais maiusculas", () => {
  expect(formatarNome("  ludwig van BEETHOVEN ")).toBe("Ludwig Van Beethoven");
});
test("formata periodo de vida", () => {
  expect(formatarPeriodo("1685-03-31", "1750-07-28")).toBe("1685–1750");
  expect(formatarPeriodo("1990-01-01", "")).toBe("1990–");
});
