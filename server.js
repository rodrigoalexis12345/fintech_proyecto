const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

// Ruta al archivo de noticias JSON y al HTML
const newsFile = path.join(__dirname, 'newsData.json');
const htmlFile = path.join(__dirname, 'public', 'index.html');

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Ruta principal para mostrar el HTML
app.get('/', (req, res) => {
    res.sendFile(htmlFile);
});

// Función para realizar web scraping y reemplazar títulos automáticamente
async function scrapeAndReplace(url) {
    try {
        console.log(`Iniciando scraping de: ${url}`);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const titles = [];
        $('h3.opinion-card__news-title').each((i, el) => {
            titles.push($(el).text().trim());
        });

        if (!titles.length) {
            console.error('No se encontraron títulos en la página.');
            return;
        }

        // Guardar los títulos en un archivo JSON
        fs.writeFileSync(newsFile, JSON.stringify(titles, null, 2), 'utf-8');
        console.log('Noticias actualizadas correctamente.');

        // Leer y modificar el HTML original con los nuevos títulos
        let htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        titles.forEach((title, index) => {
            const placeholder = `{{title${index + 1}}}`;
            htmlContent = htmlContent.replace(placeholder, title);
        });

        // Sobrescribir el archivo HTML original
        fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
        console.log('Títulos reemplazados automáticamente en el archivo HTML.');
    } catch (error) {
        console.error('Error al hacer scraping y reemplazar títulos:', error.message);
    }
}

// URL de la página a scrapear
const url = 'https://gestion.pe/opinion/?ref=gesr';

// Ejecutar el scraping y reemplazo al iniciar el servidor
scrapeAndReplace(url);

// Programar el scraping y reemplazo cada 24 horas
setInterval(() => {
    scrapeAndReplace(url);
}, 24 * 60 * 60 * 1000); // Cada 24 horas

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
