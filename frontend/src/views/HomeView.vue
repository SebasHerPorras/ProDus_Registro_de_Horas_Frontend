<script setup lang="ts">
import { ref, computed } from 'vue'

interface Task {
  id: number
  title: string
  hours: number
  completed: boolean
}

const tasks = ref<Task[]>([
  { id: 1, title: 'Desarrollo de API REST', hours: 8, completed: false },
  { id: 2, title: 'Diseño de interfaz', hours: 6, completed: true },
  { id: 3, title: 'Testing unitario', hours: 4, completed: false },
])

const newTaskTitle = ref('')
const newTaskHours = ref(0)

const totalHours = computed(() => 
  tasks.value.reduce((sum, task) => sum + task.hours, 0)
)

const completedHours = computed(() =>
  tasks.value.filter(t => t.completed).reduce((sum, task) => sum + task.hours, 0)
)

const addTask = () => {
  if (newTaskTitle.value.trim()) {
    tasks.value.push({
      id: Date.now(),
      title: newTaskTitle.value,
      hours: newTaskHours.value,
      completed: false
    })
    newTaskTitle.value = ''
    newTaskHours.value = 0
  }
}

const toggleTask = (id: number) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) task.completed = !task.completed
}

const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="home">
    <header class="hero">
      <h1 class="hero-title">Registro de Horas</h1>
      <p class="hero-subtitle">Gestiona tus tareas y tiempo de manera eficiente</p>
    </header>

    <div class="stats">
      <div class="stat-card">
        <span class="stat-number">{{ totalHours }}</span>
        <span class="stat-label">Horas Totales</span>
      </div>
      <div class="stat-card completed">
        <span class="stat-number">{{ completedHours }}</span>
        <span class="stat-label">Horas Completadas</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ tasks.length }}</span>
        <span class="stat-label">Tareas</span>
      </div>
    </div>

    <section class="add-task">
      <h2>Nueva Tarea</h2>
      <form @submit.prevent="addTask" class="task-form">
        <input 
          v-model="newTaskTitle" 
          type="text" 
          placeholder="Nombre de la tarea"
          class="input-field"
        />
        <input 
          v-model.number="newTaskHours" 
          type="number" 
          placeholder="Horas"
          class="input-field hours"
          min="0"
          step="0.5"
        />
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
    </section>

    <section class="tasks-list">
      <h2>Mis Tareas</h2>
      <transition-group name="list" tag="div" class="tasks-container">
        <div 
          v-for="task in tasks" 
          :key="task.id"
          class="task-item"
          :class="{ completed: task.completed }"
        >
          <div class="task-info">
            <input 
              type="checkbox" 
              :checked="task.completed"
              @change="toggleTask(task.id)"
              class="task-checkbox"
            />
            <span class="task-title">{{ task.title }}</span>
          </div>
          <div class="task-actions">
            <span class="task-hours">{{ task.hours }}h</span>
            <button @click="deleteTask(task.id)" class="btn-delete">
              ✕
            </button>
          </div>
        </div>
      </transition-group>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.hero-title {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.add-task {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.add-task h2 {
  margin-top: 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.task-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.input-field {
  flex: 1;
  min-width: 200px;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
}

.input-field.hours {
  flex: 0 1 120px;
  min-width: 120px;
}

.btn-primary {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.tasks-list {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tasks-list h2 {
  margin-top: 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.task-item:hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.task-item.completed {
  background: #e6fffa;
  border-color: #38ef7d;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  opacity: 0.6;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-title {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-hours {
  font-weight: 600;
  color: #667eea;
  background: #edf2f7;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.btn-delete {
  background: #fc8181;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #f56565;
}

/* Animaciones de transición */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .task-form {
    flex-direction: column;
  }
  
  .input-field,
  .input-field.hours {
    width: 100%;
    min-width: 100%;
  }
  
  .task-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .task-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
