const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Ruta para hacer scraping
app.get('/scrape', async (req, res) => {
    const url = req.query.url;  // URL pasada como parámetro de consulta

    if (!url) {
        return res.status(400).send('Por favor, proporciona una URL.');
    }

    try {
        // Realizar la solicitud HTTP a la URL proporcionada
        const response = await axios.get(url);
        
        // Extraer datos (ejemplo: primer párrafo)
        const html = response.data;
        const regex = /<p>(.*?)<\/p>/; // Expresión regular simple para obtener el primer párrafo
        const match = html.match(regex);
        
        if (match) {
            const parrafo = match[1];
            res.json({ url: url, parrafo: parrafo });
        } else {
            res.status(404).send('No se encontró el contenido.');
        }
    } catch (error) {
        res.status(500).send('Error al hacer scraping: ' + error.message);
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
