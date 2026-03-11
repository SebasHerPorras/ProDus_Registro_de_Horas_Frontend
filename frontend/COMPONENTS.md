# Estructura de Componentes ProDUS

## 📁 Organización

```
src/
├── components/          # Componentes reutilizables
│   ├── AppHeader.vue    # Encabezado de la app
│   ├── AppButton.vue    # Botón genérico
│   ├── InfoCard.vue     # Tarjeta de información
│   ├── MenuButton.vue   # Botón de menú
│   └── WelcomeBanner.vue # Banner de bienvenida
├── styles/              # Estilos y temas
│   ├── theme.ts        # Variables de color, espaciado, etc.
│   └── global.ts       # Estilos globales
├── composables/         # Lógica reutilizable
│   └── useAuth.ts      # Autenticación y usuario
├── config/             # Configuración
│   └── roles.ts        # Definición de roles
└── views/              # Vistas/páginas
    └── HomeView.vue    # Home page
```

## 🎨 Componentes Disponibles

### AppHeader
Encabezado estándar de la aplicación.

```vue
<AppHeader 
  title="ProDUS" 
  subtitle="Registro de Horas"
  user-role="Administrador"
  user-name="Juan Pérez"
  @logout="handleLogout"
/>
```

**Props:**
- `title`: string - Título principal
- `subtitle`: string - Subtítulo
- `userRole`: string - Rol del usuario
- `userName`: string - Nombre del usuario
- **Eventos:** `@logout`

---

### AppButton
Botón reutilizable con variantes.

```vue
<AppButton variant="primary" size="md">
  Enviar
</AppButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean (default: false)

---

### InfoCard
Tarjeta para mostrar información estática.

```vue
<InfoCard 
  label="Horas Registradas" 
  value="24" 
/>
```

**Props:**
- `label`: string - Etiqueta
- `value`: string | number - Valor a mostrar

---

### MenuButton
Botón para menú con icono y etiqueta.

```vue
<MenuButton 
  icon="⏱️" 
  label="Registro de Horas"
  @click="handleClick"
/>
```

**Props:**
- `icon`: string - Emoji o icono
- `label`: string - Etiqueta del botón
- **Eventos:** `@click`

---

### WelcomeBanner
Banner de bienvenida con gradiente.

```vue
<WelcomeBanner 
  title="Bienvenido, Juan" 
  subtitle="Acceso a tus herramientas de administrador"
/>
```

**Props:**
- `title`: string - Título
- `subtitle`: string - Subtítulo

## 🎨 Tema de Colores

Encontrados en `src/styles/theme.ts`:

```typescript
colors = {
  primary: '#0052a3',
  primaryDark: '#003d7a',
  primaryLight: '#0066cc',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  // ... más colores
}
```

## 📐 Espaciados

```typescript
spacing = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
}
```

## 🔄 Composables

### useAuth
Maneja autenticación y datos del usuario.

```typescript
const { 
  userRole,      // Rol actual
  userName,      // Nombre del usuario
  isAuthenticated, // ¿Está autenticado?
  logout,        // Cerrar sesión
  checkPermission, // Verificar permiso
  checkFeature   // Verificar feature
} = useAuth()
```

## ✅ Buenas Prácticas

1. **No duplicar estilos**: Usa componentes base en lugar de repetir estilos
2. **Usar el tema**: Importa colores de `theme.ts` en lugar de hardcodearlos
3. **Componentes pequeños**: Los componentes deben ser simples y enfocados
4. **Props bien tipadas**: Siempre usa TypeScript para las props
5. **Eventos nombrados claramente**: Sigue la convención Vue para nombres de eventos

## 🚀 Agregando un nuevo componente

1. Crea el archivo en `src/components/`
2. Usa colores y espaciados de `theme.ts`
3. Exporta desde el archivo principal
4. Importa en la vista donde lo necesites
5. Documenta las props en este archivo
