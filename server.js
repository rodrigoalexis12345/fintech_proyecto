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

// Función para realizar web scraping
async function scrapeNews(url) {
    try {
        console.log('Iniciando scraping de:', url);
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Selector para extraer los títulos de las noticias
        const titles = [];
        $('h3.opinion-card__news-title').each((i, el) => {
            titles.push($(el).text().trim());
        });

        // Si no se encontraron títulos, lanzar un error
        if (titles.length === 0) {
            throw new Error('No se encontraron títulos en la página');
        }

        // Guardar los títulos en el archivo JSON
        fs.writeFileSync(newsFile, JSON.stringify(titles, null, 2), 'utf-8');
        console.log('Noticias actualizadas correctamente.');
    } catch (error) {
        console.error('Error al hacer scraping:', error.message);
    }
}

// Ruta para reemplazar los títulos en el mismo HTML
app.get('/replace-titles', (req, res) => {
    // Verificar si el archivo JSON existe
    if (!fs.existsSync(newsFile)) {
        return res.status(500).send('No se ha encontrado el archivo de noticias. Realiza un scraping primero.');
    }

    try {
        // Leer los títulos desde el archivo JSON
        const titles = JSON.parse(fs.readFileSync(newsFile, 'utf-8'));

        // Leer el archivo HTML base
        let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

        // Reemplazar los títulos en el HTML
        titles.forEach((title, index) => {
            const titlePlaceholder = `{{title${index + 1}}}`;
            if (htmlContent.includes(titlePlaceholder)) {
                htmlContent = htmlContent.replace(titlePlaceholder, title);
            }
        });

        // Guardar el HTML modificado con los títulos reemplazados
        fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
        console.log('Títulos reemplazados correctamente en el archivo HTML.');

        // Enviar el HTML actualizado al cliente
        res.send(htmlContent);
    } catch (error) {
        console.error('Error al reemplazar títulos:', error.message);
        res.status(500).send('Error al reemplazar títulos.');
    }
});

// URL de la página desde la que quieres scrapear los títulos
const url = 'https://gestion.pe/opinion/?ref=gesr'; // Cambia esta URL por la que necesites

// Realiza el scraping manual al inicio del servidor
scrapeNews(url);

// Programar la ejecución del scraping cada 24 horas
setInterval(() => {
    scrapeNews(url);  // Llama a la función con la URL especificada
}, 24 * 60 * 60 * 1000); // Cada 24 horas

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
