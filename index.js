const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Para recibir JSON desde el frontend

app.post("/preguntar", async (req, res) => {
  const { pregunta } = req.body;

  if (!pregunta) {
    return res.status(400).json({ error: "Debes enviar una pregunta" });
  }

  try {
    // Lanzar navegador en modo headless (sin interfaz)
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Ir a la página de Copilot
    await page.goto(
      "https://copilot.microsoft.com/chats/LG18W2X4gD7MdzugnJcdB"
    );
    await page.waitForTimeout(5000); // Esperar que cargue la página

    // Escribir la pregunta en el textarea y enviar
    await page.fill("#userInput", pregunta);
    await page.keyboard.press("Enter");

    // Esperar respuesta
    await page.waitForTimeout(10000);

    // Capturar la última respuesta
    const respuestas = await page.$$("div.space-y-3.break-words");
    const ultimaRespuesta =
      respuestas.length > 0
        ? await respuestas[respuestas.length - 1].textContent()
        : "No se encontró respuesta.";

    await browser.close(); // Cerrar navegador

    res.json({ respuesta: ultimaRespuesta.trim() });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Hubo un problema al obtener la respuesta." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
