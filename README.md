# ⚡ TrabajaYa | Inteligencia Artificial para la Empleabilidad
> **Proyecto de Graduación • Seminario de Tecnologías de Información 2026**  
> **Universidad Mariano Gálvez de Guatemala — Campus El Naranjo**

---

## 👥 Equipo de Autores & Desarrolladores
- **Nery** — *Scrum Master / Project Manager*
- **Joshua** — *Desarrollador Backend*
- **Mario** — *Desarrollador Frontend (Expo)*
- **Walter** — *Integración de IA*
- **Keily** — *Documentación + QA*

---

## 🌐 Despliegue en Producción
- **URL Pública:** [https://trabajaya.tld-list.lat/](https://trabajaya.tld-list.lat/)
- **Acceso Demo VIP:** `demo@trabajaya.lat` / `demo123` *(Plan PRO Ilimitado activo)*

---

## 🏗️ Arquitectura Técnica
- **Sistema Operativo:** Debian 13 (Trixie) GNU/Linux
- **Backend:** Node.js Express 5 con soporte ES Modules
- **Base de Datos:** PostgreSQL 16 (Contenerizado en Docker)
- **Túnel de Conectividad:** Cloudflare Zero Trust Tunnel (Salida cifrada HTTPS)
- **Motor de Inteligencia Artificial:** Google Gemini 3.6 Flash
  - OCR Multimodal para lectura de currículums en PDF (múltiples columnas, escaneados o baja resolución).
  - Algoritmo de afinidad curricular ATS con detección de brechas (*Gap Analysis*).
  - Generación de CV adaptado en estilos **Estándar ATS** y **Formal Ejecutivo**.
  - Simulador de entrevistas dinámico bajo metodología **STAR**.

---

## 🚀 Puesta en Marcha Local (Para el Equipo)

### 1. Requisitos Previos
- Node.js v20+
- Docker & Docker Compose (para PostgreSQL)

### 2. Variables de Entorno
Copiar el archivo de ejemplo:
```bash
cp backend/.env.example backend/.env
```
Configurar la `GEMINI_API_KEY` y credenciales de base de datos.

### 3. Iniciar Base de Datos
```bash
docker compose up -d
```

### 4. Instalar Dependencias y Arrancar Backend
```bash
cd backend
npm install
node server.js
```
