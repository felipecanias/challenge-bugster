# Challenge Bugster

## 🚀 Características

- Frontend construido con Next.js 15 y React 19
- Backend con Express.js y Playwright
- Estilizado con Tailwind CSS

## 📋 Prerrequisitos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Git

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd challenge-bugster
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Ejecución del Proyecto

### Iniciar el Backend

```bash
cd backend
npm start
```

El servidor backend se ejecutará en `http://localhost:3001`

### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación frontend estará disponible en `http://localhost:3000`

## 🤔 Decisiones Técnicas

Una de las decisiones más importantes fue implementar un sistema de streaming para las ejecuciones de Playwright. En lugar de embeber un navegador en el frontend, opté por transmitir las ejecuciones en tiempo real. Esta decisión se tomó debido a la falta de opciones nativas en Playwright para integrar un navegador directamente en el frontend, y las soluciones existentes no eran viables y carecían de soporte adecuado.

El enfoque de streaming ofrece varias ventajas:

- **Ligereza:** Al no requerir la ejecución de un navegador en modo gráfico (headful), el sistema es más liviano y fácil de llevar a producción.
- **Eficiencia:** Permite observar las ejecuciones en tiempo real sin sobrecargar el frontend, mejorando así la experiencia del usuario y la eficiencia del sistema.

Esta solución no solo simplifica la arquitectura del proyecto, sino que también mejora su escalabilidad y mantenibilidad a largo plazo.


