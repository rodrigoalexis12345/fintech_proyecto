import requests
from bs4 import BeautifulSoup
response = requests.get("https://gestion.pe/opinion/la-industria-fintech-recien-esta-en-su-primer-minuto-noticia/")
bs = BeautifulSoup(response.text, "lxml")
print(bs.find("p").text)
