from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    # URL a extraer
    url = "https://gestion.pe/opinion/la-industria-fintech-recien-esta-en-su-primer-minuto-noticia/?ref=gesr"
    response = requests.get(url)
    
    # Procesar el HTML
    soup = BeautifulSoup(response.text, "lxml")
    page_title = soup.title.text  # Extraer el título de la página

    return render_template("form.html", page_title=page_title)

