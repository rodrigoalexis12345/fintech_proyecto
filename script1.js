$(document).ready(function () {
  $.ajax({
    url: "http://localhost:4000/proyectos",
    method: "GET",
    success: function (proyectos) {
      const proyectosContainer = $("#proyectosContainer");

      proyectos.forEach((proyecto) => {
        // Asigna manualmente la ruta de la imagen según el id del proyecto
        let imagenSrc = "";
        switch (proyecto.id) {
          case 1:
            imagenSrc = "/img/proyecto1.jfif";
            break;
          case 2:
            imagenSrc = "/img/proyecto2.png";
            break;
          case 3:
            imagenSrc = "/img/proyecto3.jfif";
            break;
          // Agrega más casos según la cantidad de proyectos
        }

        const proyectoCard = `
            <div class="col-md-4">
              <div class="card project-card">
                <img src="${imagenSrc}" class="card-img-top" alt="${proyecto.nombre}">
                <div class="card-body">
                  <h5 class="card-title">${proyecto.nombre}</h5>
                  <p class="card-text">${proyecto.descripcion}</p>
                </div>
              </div>
            </div>
          `;
        proyectosContainer.append(proyectoCard);
      });
    },
    error: function (error) {
      console.error("Error al cargar los proyectos:", error);
    },
  });
});
