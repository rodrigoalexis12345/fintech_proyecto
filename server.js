const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;

// Ruta al archivo de noticias JSON y al HTML
const newsFile = path.join(__dirname, 'newsData.json');
const htmlFile = path.join(__dirname, 'public', 'noticias.html'); // Archivo de destino para los títulos e imágenes

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Ruta principal para mostrar el HTML de noticias
app.get('/', (req, res) => {
    res.sendFile(htmlFile);
});

// Función para realizar web scraping y reemplazar títulos e imágenes en `noticias.html`
async function scrapeAndReplaceInNoticias(url) {
    try {
        console.log(`Iniciando scraping de: ${url}`);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extraer títulos de las noticias
        const titles = [];
        $('.opinion-list__title a').each((i, el) => {
            titles.push($(el).text().trim());
        });

        // Extraer URLs de las imágenes relacionadas
        const images = [];
        $('.opinion-list__img img').each((i, el) => {
            images.push($(el).attr('src').trim());
        });

        if (!titles.length || !images.length) {
            console.error('No se encontraron títulos o imágenes en la página.');
            return;
        }

        // Guardar los títulos e imágenes en un archivo JSON (opcional)
        const newsData = titles.map((title, index) => ({
            title,
            image: images[index] || null, // Asocia título con imagen
        }));
        fs.writeFileSync(newsFile, JSON.stringify(newsData, null, 2), 'utf-8');
        console.log('Noticias e imágenes actualizadas correctamente.');

        // Leer el archivo HTML base
        let htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        const $html = cheerio.load(htmlContent);

        // Reemplazar títulos e imágenes en el contenedor de noticias
        const listItems = $html('#news-list li');
        listItems.each((index, li) => {
            const title = newsData[index]?.title;
            const image = newsData[index]?.image;

            if (title) {
                $html(li).find('a').text(title); // Reemplaza el texto del título
            }

            if (image) {
                $html(li).find('img').attr('src', image); // Reemplaza la URL de la imagen
            }
        });

        // Guardar el HTML modificado
        fs.writeFileSync(htmlFile, $html.html(), 'utf-8');
        console.log('Títulos e imágenes reemplazados correctamente en noticias.html.');
    } catch (error) {
        console.error('Error al hacer scraping y reemplazar títulos e imágenes:', error.message);
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
