import { describe, it, expect } from "vitest";

import {
  normalizeMessage,
  isValidMessage,
  addToHistory,
  buildChatRequest
} from "../src/utils.js";


describe("Utilidades de Hello Jadoo", () => {

  it("debería eliminar espacios al inicio y al final de un mensaje", () => {
    const result = normalizeMessage("  Hola Jadoo  ");

    expect(result).toBe("Hola Jadoo");
  });


  it("debería identificar correctamente un mensaje válido", () => {
    expect(isValidMessage("Hola Jadoo")).toBe(true);
  });


  it("debería rechazar un mensaje vacío", () => {
    expect(isValidMessage("   ")).toBe(false);
  });


  it("debería agregar correctamente un mensaje al historial", () => {
    const history = [];

    const result = addToHistory(
      history,
      "user",
      "Hola Jadoo"
    );

    expect(result).toEqual([
      {
        role: "user",
        content: "Hola Jadoo"
      }
    ]);
  });


  it("debería construir correctamente la petición del chat", () => {
    const history = [
      {
        role: "user",
        content: "Hola"
      }
    ];

    const result = buildChatRequest(
      "¿Cómo estás?",
      history
    );

    expect(result).toEqual({
      message: "¿Cómo estás?",
      history
    });
  });

});