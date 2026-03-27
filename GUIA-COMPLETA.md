# 🚀 Gastos Diarios — Guía Completa Fullstack
## PC + Celular sincronizados en tiempo real

---

## ¿Qué hace esta versión diferente?

| Versión anterior | Esta versión |
|-----------------|--------------|
| Datos solo en el navegador | Datos en servidor (base de datos real) |
| PC y celular NO sincronizados | PC y celular sincronizados al instante |
| Sin internet = sin problemas | Necesita servidor corriendo |
| Gratis, sin configuración | Requiere Railway (gratis) para internet |

Cuando registras un gasto en el celular → aparece en la PC en menos de 1 segundo. Y viceversa.

---

# PARTE 1 — Correr en tu PC (local)

## PASO 1 — Descomprimir y abrir en VS Code

1. Descomprime `gastos-diarios-fullstack.tar.gz` con 7-Zip
   - Clic derecho → "Extraer aquí"
2. Abre VS Code
3. `File` → `Open Folder` → selecciona la carpeta `gastos-fullstack`
4. Clic en **"Yes, I trust"**

Verás esta estructura:
```
gastos-fullstack/
├── backend/          ← Servidor Node.js + base de datos
│   ├── server.js
│   ├── db.js
│   └── package.json
├── frontend/         ← App React (lo que ves en pantalla)
│   ├── src/
│   ├── index.html
│   └── package.json
└── package.json
```

---

## PASO 2 — Instalar dependencias del backend

1. Abre la terminal en VS Code: `Terminal` → `New Terminal`
2. Navega al backend:
```
cd backend
```
3. Instala:
```
npm install
```
Espera hasta ver: `added XX packages`

---

## PASO 3 — Instalar dependencias del frontend

En la misma terminal:
```
cd ../frontend
npm install
```
Espera hasta ver: `added XX packages`

---

## PASO 4 — Abrir DOS terminales

Necesitas correr backend y frontend al mismo tiempo.

**Terminal 1 — Backend:**
1. `Terminal` → `New Terminal`
2. Escribe:
```
cd backend
node server.js
```
Deberías ver:
```
✅ Base de datos lista
🚀 Backend en http://localhost:3001
```
**Deja esta terminal abierta. NO la cierres.**

**Terminal 2 — Frontend:**
1. `Terminal` → `Split Terminal` (ícono de dividir, arriba a la derecha del panel)
2. Escribe:
```
cd frontend
npm run dev
```
Deberías ver:
```
➜  Local:   http://localhost:5173/
```

---

## PASO 5 — Abrir la app

Ve a: **http://localhost:5173**

Verás el ícono 🟢 **Sync** en la esquina superior derecha.
Eso significa que está conectado al servidor.

---

## PASO 6 — Acceder desde el celular (en casa, por WiFi)

### Encontrar tu IP local:
1. Presiona `Windows + R`
2. Escribe `cmd` y Enter
3. Escribe `ipconfig`
4. Busca **"Dirección IPv4"** → algo como `192.168.1.5`

### En tu celular:
1. Conéctate al **mismo WiFi** que tu PC
2. Abre Chrome
3. Escribe: `http://192.168.1.5:5173` (con tu IP real)
4. ¡La app abre!

### Prueba la sincronización:
- Registra un gasto en el celular
- Míralo aparecer en la PC en tiempo real ✨

---

# PARTE 2 — Publicar en internet (acceso desde cualquier lugar)

Para esto usarás **Railway** (gratis) para el backend y **Vercel** (gratis) para el frontend.

---

## PASO 7 — Subir el código a GitHub

Si no tienes cuenta en GitHub: ve a **https://github.com** → Sign Up

### En la terminal de VS Code (desde la raíz del proyecto):
```
git init
git add .
git commit -m "gastos diarios fullstack"
```

En GitHub → crea un repositorio llamado `gastos-diarios-fullstack` (sin README)

Luego en la terminal:
```
git remote add origin https://github.com/TU_USUARIO/gastos-diarios-fullstack.git
git branch -M main
git push -u origin main
```

---

## PASO 8 — Publicar el BACKEND en Railway

Railway es como "tu PC en internet". Corre tu servidor 24/7 gratis.

1. Ve a **https://railway.app**
2. Clic en **"Start a New Project"**
3. Elige **"Deploy from GitHub repo"**
4. Autoriza Railway a ver tus repositorios
5. Selecciona `gastos-diarios-fullstack`
6. Cuando pregunte qué carpeta: escribe `backend`

### Configurar el backend en Railway:
1. Una vez creado el proyecto, ve a tu servicio → **"Settings"**
2. En **"Root Directory"** escribe: `backend`
3. En **"Start Command"** escribe: `node server.js`
4. Guarda los cambios

### Obtener tu URL del backend:
1. Ve a la pestaña **"Settings"** → **"Domains"**
2. Clic en **"Generate Domain"**
3. Te dará algo como: `https://gastos-backend-production.railway.app`
4. **Copia esta URL** (la necesitas en el siguiente paso)

---

## PASO 9 — Configurar el frontend para usar el backend en internet

1. En VS Code, abre el archivo `frontend/.env.example`
2. Crea un nuevo archivo llamado `.env` en la carpeta `frontend/`
3. Escribe dentro:
```
VITE_API_URL=https://gastos-backend-production.railway.app
```
(Pon tu URL real de Railway)

4. Guarda, luego sube el cambio:
```
git add .
git commit -m "configurar URL de produccion"
git push
```

---

## PASO 10 — Publicar el FRONTEND en Vercel

1. Ve a **https://vercel.com** → Sign Up with GitHub
2. **"Add New Project"** → importa `gastos-diarios-fullstack`
3. En **"Root Directory"** escribe: `frontend`
4. En **"Environment Variables"** agrega:
   - Key: `VITE_API_URL`
   - Value: `https://tu-url.railway.app` (tu URL de Railway)
5. Clic en **"Deploy"**

En 2 minutos tendrás tu URL pública:
```
https://gastos-diarios.vercel.app
```

---

## PASO 11 — Instalar en el celular como app

### Android (Chrome):
1. Abre tu URL de Vercel en Chrome
2. Menú (3 puntos) → **"Añadir a pantalla de inicio"**
3. Queda como app nativa con ícono

### iPhone (Safari):
1. Abre la URL en Safari
2. Botón compartir → **"Añadir a pantalla de inicio"**

---

## 🔄 Cómo actualizar la app en el futuro

Cada vez que quieras hacer cambios:
```
git add .
git commit -m "descripción del cambio"
git push
```
Railway y Vercel se actualizan automáticamente.

---

## ⚠️ Errores comunes

### 🔴 La app muestra "Sin conexión"
→ El backend no está corriendo.
- Local: verifica que `node server.js` esté activo en la terminal
- Internet: verifica que Railway esté corriendo (ve al dashboard)

### 🔴 El celular no conecta por WiFi
→ PC y celular deben estar en el MISMO WiFi
→ Verifica que la IP sea correcta con `ipconfig`

### 🔴 Railway da error en el deploy
→ Verifica que "Root Directory" sea `backend` y Start Command sea `node server.js`

### 🔴 Vercel da error de build
→ Verifica que "Root Directory" sea `frontend`
→ Verifica que la variable `VITE_API_URL` esté configurada

---

## 📌 Resumen de comandos diarios

```bash
# Correr en local (necesitas 2 terminales)

# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

```bash
# Subir cambios a internet
git add .
git commit -m "mi cambio"
git push
```

---

## 🌐 URLs finales esperadas

| Qué | URL |
|-----|-----|
| App (frontend) | https://gastos-diarios.vercel.app |
| Backend | https://gastos-backend.railway.app |
| API health check | https://gastos-backend.railway.app/api/health |




la ultima 