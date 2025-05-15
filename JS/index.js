function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
  }

  document.addEventListener("DOMContentLoaded", function () {
  // Verifica se o elemento do carrossel existe
  const carouselEl = document.getElementById("carouselPropagandas");

  if (carouselEl) {
    // Inicializa o carrossel manualmente
    const carousel = new bootstrap.Carousel(carouselEl, {
      interval: 4000, // Tempo entre slides (ms)
      ride: 'carousel',
      pause: 'hover',
      wrap: true
    });

    // Opcional: Adicione eventos personalizados se quiser
    carouselEl.addEventListener('slid.bs.carousel', function (event) {
      console.log(`Slide ativo: ${event.to}`);
    });
  }
});
