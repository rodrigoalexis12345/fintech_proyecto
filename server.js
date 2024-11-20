const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

// Ruta al archivo de noticias JSON y al HTML
const newsFile = path.join(__dirname, 'newsData.json'); // Archivo JSON
const htmlFile = path.join(__dirname, 'noticias.html'); // Archivo HTML en la misma carpeta que server.js

// Base URL para construir enlaces completos
const BASE_URL = 'https://gestion.pe';

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para mostrar el HTML de noticias
app.get('/', (req, res) => {
    res.sendFile(htmlFile);
});

// Función para realizar web scraping y reemplazar datos en `noticias.html`
async function scrapeAndReplaceInNoticias(url) {
    try {
        console.log(`Iniciando scraping de: ${url}`);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extraer títulos, imágenes y URLs de las noticias
        const newsData = [];
        $('.opinion-list__title a').each((i, el) => {
            const title = $(el).text().trim();
            const relativeLink = $(el).attr('href').trim(); // Capturar la URL relativa
            const link = new URL(relativeLink, BASE_URL).href; // Construir URL completa
            newsData.push({ title, link });
        });

        $('.opinion-list__img img').each((i, el) => {
            if (newsData[i]) {
                newsData[i].image = $(el).attr('src').trim(); // Asociar la imagen al título correspondiente
            }
        });

        if (!newsData.length) {
            console.error('No se encontraron datos de noticias en la página.');
            return;
        }

        // Guardar los datos en un archivo JSON (opcional)
        fs.writeFileSync(newsFile, JSON.stringify(newsData, null, 2), 'utf-8');
        console.log('Noticias actualizadas correctamente.');

        // Leer el archivo HTML base
        let htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        const $html = cheerio.load(htmlContent);

        // Reemplazar títulos, imágenes y enlaces en el contenedor de noticias
        const listItems = $html('#news-list li');
        listItems.each((index, li) => {
            const news = newsData[index];
            if (news) {
                $html(li).find('a').text(news.title); // Reemplazar el título
                $html(li).find('a').attr('href', news.link); // Actualizar el enlace
                if (news.image) {
                    $html(li).find('img').attr('src', news.image); // Reemplazar la imagen
                }
            }
        });

        // Guardar el HTML modificado
        fs.writeFileSync(htmlFile, $html.html(), 'utf-8');
        console.log('Títulos, imágenes y enlaces reemplazados correctamente en noticias.html.');
    } catch (error) {
        console.error('Error al hacer scraping y reemplazar datos:', error.message);
    }
}

// URL de la página a scrapear
const url = 'https://gestion.pe/opinion/?ref=gesr';

// Ejecutar el scraping y reemplazo al iniciar el servidor
scrapeAndReplaceInNoticias(url);

// Programar el scraping y reemplazo cada 24 horas
setInterval(() => {
    scrapeAndReplaceInNoticias(url);
}, 24 * 60 * 60 * 1000); // Cada 24 horas

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
