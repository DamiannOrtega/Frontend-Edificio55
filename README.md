# 🌐 Frontend - Sistema de Gestión de Laboratorios

Interfaz de usuario moderna para el sistema de gestión de laboratorios del Edificio 55, construida con React, TypeScript y Tailwind CSS.

## ✨ Características

- **🎨 Interfaz Moderna:** Diseño limpio y responsive
- **⚡ Rendimiento:** Construido con Vite para máxima velocidad
- **🔧 TypeScript:** Tipado estático para mayor robustez
- **🎯 Componentes Reutilizables:** Biblioteca de componentes UI
- **📱 Responsive:** Funciona en desktop, tablet y móvil
- **♿ Accesibilidad:** Cumple estándares de accesibilidad

## 🛠️ Tecnologías

- **React 18+** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes de interfaz
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

## 🚀 Instalación

### Prerrequisitos
- Node.js 16 o superior
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd Frontend-Edificio55
```

2. **Instalar dependencias:**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
```

Editar `.env.local` con la URL del backend:
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── LabVisitForm.tsx # Formulario principal de registro
│   └── ui/              # Componentes de interfaz base
│       ├── button.tsx   # Componente de botón
│       ├── input.tsx    # Componente de input
│       ├── select.tsx   # Componente de select
│       └── ...
├── pages/               # Páginas de la aplicación
│   ├── Index.tsx        # Página principal
│   ├── Navigation.tsx   # Navegación
│   └── NotFound.tsx     # Página 404
├── services/            # Servicios API
│   └── api.ts          # Cliente HTTP
├── lib/                 # Utilidades
│   └── utils.ts        # Funciones auxiliares
├── hooks/               # Custom hooks
├── App.tsx              # Componente principal
└── main.tsx             # Punto de entrada
```

## 🎯 Componentes Principales

### LabVisitForm
Componente principal para el registro de visitas de estudiantes.

**Características:**
- Validación en tiempo real
- Carga dinámica de laboratorios y PCs disponibles
- Selección de software instalado
- Manejo de estados de carga y errores

**Uso:**
```tsx
import { LabVisitForm } from './components/LabVisitForm'

function App() {
  return (
    <div className="container mx-auto p-4">
      <LabVisitForm />
    </div>
  )
}
```

### Componentes UI
Biblioteca de componentes reutilizables basados en Shadcn/ui:

- **Button:** Botones con variantes y estados
- **Input:** Campos de entrada con validación
- **Select:** Selectores con búsqueda
- **Label:** Etiquetas de formulario
- **Textarea:** Áreas de texto
- **Toast:** Notificaciones

## 🔌 Integración con API

### Cliente API
```typescript
// services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL

export const api = {
  // Obtener laboratorios disponibles
  getLaboratorios: () => fetch(`${API_BASE_URL}/laboratorios/`),
  
  // Obtener PCs disponibles
  getPCsDisponibles: (laboratorioId: string) => 
    fetch(`${API_BASE_URL}/pcs/?laboratorio=${laboratorioId}&disponible=true`),
  
  // Registrar visita
  registrarVisita: (data: VisitaData) => 
    fetch(`${API_BASE_URL}/visitas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
}
```

### Tipos TypeScript
```typescript
interface Laboratorio {
  id: string
  nombre: string
  descripcion?: string
  disponible: boolean
}

interface PC {
  id: string
  numero_pc: number
  laboratorio: string
  estado: 'Disponible' | 'En Uso' | 'Reservada' | 'Mantenimiento'
  disponible_para_uso: boolean
}

interface VisitaData {
  estudiante: {
    id: string
    nombre_completo: string
    correo: string
  }
  pc: string
  software_utilizado?: string[]
}
```

## 🎨 Estilos y Temas

### Tailwind CSS
El proyecto utiliza Tailwind CSS para estilos. Configuración personalizada en `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  },
  plugins: []
}
```

### Componentes con Variantes
```tsx
// Ejemplo de componente con variantes
<Button variant="primary" size="lg">
  Registrar Visita
</Button>

<Button variant="secondary" size="sm">
  Cancelar
</Button>
```

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

### Ejemplo de Layout Responsive
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-1 md:col-span-2 lg:col-span-1">
    {/* Contenido adaptativo */}
  </div>
</div>
```

## 🧪 Testing

### Configuración de Pruebas
```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Ejecutar pruebas
npm run test

# Ejecutar pruebas en modo watch
npm run test:watch
```

### Ejemplo de Prueba
```typescript
import { render, screen } from '@testing-library/react'
import { LabVisitForm } from './LabVisitForm'

test('renders lab visit form', () => {
  render(<LabVisitForm />)
  expect(screen.getByText('Registrar Visita')).toBeInTheDocument()
})
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build

# Testing
npm run test         # Ejecutar pruebas
npm run test:watch   # Pruebas en modo watch
npm run test:coverage # Con cobertura

# Linting
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores automáticamente

# Type checking
npm run type-check   # Verificar tipos TypeScript
```

## 🔧 Configuración

### Variables de Entorno
```env
# .env.local
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Sistema de Laboratorios
VITE_APP_VERSION=1.0.0
```

### Configuración de Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

## 📦 Build y Despliegue

### Build para Producción
```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`.

### Despliegue Estático
El build puede ser desplegado en cualquier servidor web estático:
- **Netlify**
- **Vercel**
- **GitHub Pages**
- **AWS S3**

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🎯 Mejores Prácticas

### Código
- **Componentes Funcionales:** Usar hooks en lugar de clases
- **Props Typing:** Tipar todas las props con TypeScript
- **Custom Hooks:** Extraer lógica reutilizable
- **Error Boundaries:** Manejar errores gracefully

### Performance
- **Lazy Loading:** Cargar componentes bajo demanda
- **Memoización:** Usar React.memo y useMemo
- **Code Splitting:** Dividir el bundle por rutas
- **Optimización de Imágenes:** Usar formatos modernos

### Accesibilidad
- **ARIA Labels:** Etiquetas para lectores de pantalla
- **Keyboard Navigation:** Navegación por teclado
- **Color Contrast:** Contraste adecuado
- **Focus Management:** Manejo del foco

## 🐛 Debugging

### Herramientas de Desarrollo
- **React DevTools:** Extensión del navegador
- **Vite DevTools:** Herramientas de Vite
- **Browser DevTools:** Herramientas nativas

### Logging
```typescript
// Debug en desarrollo
if (import.meta.env.DEV) {
  console.log('Debug info:', data)
}

// Error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }
}
```

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Crear rama feature
3. Commit con conventional commits
4. Push y crear PR

### Estándares
- **ESLint:** Configuración estricta
- **Prettier:** Formateo automático
- **TypeScript:** Tipado estricto
- **Testing:** Cobertura mínima 80%

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Guía de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

---

**Desarrollado con ❤️ para una experiencia de usuario excepcional**