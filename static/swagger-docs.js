window.addEventListener("load", function () {
  const container = document.querySelector(".swagger-ui");
  if (!container) return;

  const banner = document.createElement("div");
  banner.className = "custom-swagger-banner";
  banner.innerHTML = `
    <img class="custom-swagger-logo" src="https://static1.smartbear.co/swagger/media/assets/images/swagger_logo.svg" alt="Swagger logo" />
    <div class="custom-swagger-meta">
      <div class="custom-swagger-title">Swagger UI</div>
      <div class="custom-swagger-version">Versión del API: 0.1.0</div>
    </div>
  `;

  container.parentNode.insertBefore(banner, container);
});