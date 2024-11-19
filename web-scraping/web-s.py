import requests
from bs4 import BeautifulSoup

# Realizar la solicitud a la página web
response = requests.get("https://gestion.pe/opinion/la-industria-fintech-recien-esta-en-su-primer-minuto-noticia/")
bs = BeautifulSoup(response.text, "lxml")

# Extraer el primer párrafo
parrafo = bs.find("p").text

# Crear un archivo HTML donde vamos a mostrar la información obtenida
html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultado del Web Scraping</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
        }}
        .content {{
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }}
    </style>
</head>
<body>

    <div class="content">
        <h1>Información extraída</h1>
        <p>{parrafo}</p>
    </div>

</body>
</html>
"""

# Guardar el contenido en un archivo HTML
with open("resultado_scraping.html", "w", encoding="utf-8") as file:
    file.write(html_content)

print("La información se ha guardado correctamente en 'resultado_scraping.html'.")
