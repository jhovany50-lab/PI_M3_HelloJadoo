import { describe, it, expect, vi } from "vitest";
import { sendChatMessage } from "../src/chatApi.js";

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

    it("debería obtener correctamente la respuesta de Jadoo desde la API", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        reply: "¡Hola! ¿Cómo estás?"
      })
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const result = await sendChatMessage(
      "Hola Jadoo",
      [],
      null
    );

    expect(result).toEqual({
      reply: "¡Hola! ¿Cómo estás?"
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/functions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Hola Jadoo",
          history: [],
          userProfile: null
        })
      }
    );

    vi.unstubAllGlobals();
  });

    it("debería manejar correctamente un error de la API", async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "Error en el servidor"
      })
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await expect(
      sendChatMessage(
        "Hola Jadoo",
        [],
        null
      )
    ).rejects.toThrow("Error en el servidor");

    vi.unstubAllGlobals();
  });

});