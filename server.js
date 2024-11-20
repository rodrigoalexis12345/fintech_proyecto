const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3000;


const newsFile = path.join(__dirname, 'newsData.json'); 
const htmlFile = path.join(__dirname, 'noticias.html'); 

// Middleware para servir imágenes locales (logos, íconos, etc.)
app.use('/img', express.static(path.join(__dirname, 'img'))); 


app.get('/', (req, res) => {
    res.sendFile(htmlFile);
});


async function scrapeAndReplaceInNoticias(url) {
    try {
        console.log(`Iniciando scraping de: ${url}`);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);


        const newsData = [];
        $('.opinion-list__title a').each((i, el) => {
            const title = $(el).text().trim();
            const relativeLink = $(el).attr('href').trim(); 
            const link = new URL(relativeLink, 'https://gestion.pe').href; 
            newsData.push({ title, link });
        });

        $('.opinion-list__img img').each((i, el) => {
            if (newsData[i]) {
                const remoteImage = $(el).attr('src').trim(); 
                newsData[i].image = remoteImage; 
            }
        });

        if (!newsData.length) {
            console.error('No se encontraron datos de noticias en la página.');
            return;
        }

     
        fs.writeFileSync(newsFile, JSON.stringify(newsData, null, 2), 'utf-8');
        console.log('Noticias actualizadas correctamente.');


        let htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        const $html = cheerio.load(htmlContent);


        const listItems = $html('#news-list li');
        listItems.each((index, li) => {
            const news = newsData[index];
            if (news) {
                $html(li).find('a').text(news.title); 
                $html(li).find('a').attr('href', news.link); 
                if (news.image) {
                    $html(li).find('img').attr('src', news.image); 
                }
            }
        });


        fs.writeFileSync(htmlFile, $html.html(), 'utf-8');
        console.log('Títulos, imágenes y enlaces reemplazados correctamente en noticias.html.');
    } catch (error) {
        console.error('Error al hacer scraping y reemplazar datos:', error.message);
    }
}


const url = 'https://gestion.pe/opinion/?ref=gesr';


scrapeAndReplaceInNoticias(url);


setInterval(() => {
    scrapeAndReplaceInNoticias(url);
}, 24 * 60 * 60 * 1000); 

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
