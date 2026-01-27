<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

function goHome(breakIframe: boolean) {
  if (breakIframe) {
    window.top!.location.href = '/home'
  } else {
    // 🧩 se queda dentro del iframe
    router.push('/home')
  }
}

function handleLogin() {
  error.value = ''

  if (username.value === 'sebas') {
    goHome(true)
    return
  }

  if (username.value === 'esteban') {
    goHome(false)
    return
  }

  error.value = 'Usuario inválido (usa sebas o esteban)'
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Iniciar sesión</h2>

      <input
        v-model="username"
        type="text"
        placeholder="Usuario"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Contraseña"
      />

      <button @click="handleLogin">
        Entrar
      </button>

      <p class="forgot">¿Olvidaste tu contraseña?</p>

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </div>
  </div>
</template>
