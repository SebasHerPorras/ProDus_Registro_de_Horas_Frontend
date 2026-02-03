<template>
  <div class="blocked-container">
    <div class="card">
      <h2>Acceso bloqueado</h2>
      <p>
        Esta aplicación solo está accesible desde la red del instituto.
      </p>
      <p class="hint">
        Si crees que esto es un error, contacta al administrador.
      </p>
    </div>
  </div>
</template>

<style scoped>
.blocked-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.card {
  max-width: 520px;
  padding: 2rem;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

h2 {
  margin-bottom: 0.75rem;
  color: #d32f2f;
}

p {
  margin: 0.5rem 0;
  color: #444;
}

.hint {
  font-size: 0.95rem;
  color: #666;
}
</style>
