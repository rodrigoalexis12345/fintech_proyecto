document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:4000/eventos");
    const eventos = await response.json();

    // Array de imágenes locales
    const imagenes = [
      "/img/Eventos-calendario1.jpg",
      "/img/Eventos-calendario2.jpg",
      "/img/Eventos-calendario3.jpg",
      "images/evento4.jpg",
    ];

    const carouselContent = document.getElementById("carouselContent");

    eventos.forEach((evento, index) => {
      const isActive = index === 0 ? "active" : "";
      const carouselItem = document.createElement("div");
      carouselItem.className = `carousel-item ${isActive}`;
      carouselItem.innerHTML = `
        <img src="${
          imagenes[index % imagenes.length]
        }" class="d-block w-100" alt="${
        evento.nombre
      }" style="height: 330px; object-fit: cover;">
        <div class="carousel-caption d-none d-md-block">
          <h5>${evento.nombre}</h5>
          <p>${evento.descripcion}</p>
          <p><strong>Fecha:</strong> ${evento.fecha}</p>
          <p><strong>Ubicación:</strong> ${evento.ubicacion}</p>
        </div>
      `;
      carouselContent.appendChild(carouselItem);
    });
  } catch (error) {
    console.error("Error al cargar los eventos:", error);
  }
});
