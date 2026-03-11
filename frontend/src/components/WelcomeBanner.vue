<template>
  <section class="welcome-banner">
    <div class="banner-content">
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<style scoped>
.welcome-banner {
  background: linear-gradient(135deg, #0052a3 0%, #003d7a 100%);
  color: white;
  padding: 3rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.banner-content h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.banner-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 2rem;
  }

  .banner-content h2 {
    font-size: 1.5rem;
  }
}
</style>
