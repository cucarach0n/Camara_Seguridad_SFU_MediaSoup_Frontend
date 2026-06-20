# Cámara MCU Frontend - Vue 3 + TailwindCSS

Este es el cliente del ecosistema WebRTC SFU. Está desarrollado con **Vue 3**, **Vite**, y cuenta con una estética oscura y moderna potenciada por **Tailwind CSS v4**.

## Características
- **Streamer:** Captura la webcam local y transmite el flujo de video y audio hacia el servidor SFU de Mediasoup.
- **Viewer:** Consume activamente las transmisiones en vivo. Al usar la arquitectura SFU, permite escalar a muchos espectadores sin penalizar el ancho de banda original del streamer.
- **Soporte TURN:** Compatible con la inyección dinámica de servidores TURN a través de variables de entorno, vital para evadir firewalls estrictos y asegurar conexiones en todas las topologías de red.

## Requisitos previos
- Node.js v22+

## Instalación

```bash
$ npm install
```

## Configuración
Renombra el archivo `.env.example` a `.env` e ingresa la ruta de tu servidor backend y la información de tus servidores TURN:
```bash
cp .env.example .env
```

## Compilación y Ejecución

```bash
# servidor de desarrollo local (HMR habilitado)
$ npm run dev

# construcción y empaquetado para producción
$ npm run build

# vista previa del empaquetado final
$ npm run preview
```
