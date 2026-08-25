# TikTok Live Manager

Sistema web para gestionar ventas realizadas mediante transmisiones en vivo de TikTok.

El proyecto nació como una solución para organizar el flujo de ventas de un pequeño negocio que comercializa prendas durante transmisiones en vivo: asignación de códigos a productos, registro de clientas, gestión de carritos, pagos y entregas.

Actualmente se encuentra en proceso de evolución desde un MVP funcional hacia una arquitectura más robusta, con especial atención en seguridad, integridad de datos y reglas de negocio.

---

## 📌 Descripción

Durante una transmisión en vivo, cada prenda recibe un código aleatorio que permite identificarla rápidamente.

Cuando una clienta gana una prenda, la operación se registra en el sistema y se asocia con:

* La clienta.
* El directo.
* La prenda.
* El precio.
* El estado de la operación.

A partir de ahí, el sistema permite administrar el carrito de cada clienta, registrar pagos, calcular saldos pendientes y gestionar posteriormente las entregas.

Además, existe un catálogo web independiente que permite a las clientas consultar productos disponibles, acumular prendas y utilizar WhatsApp para continuar el proceso de compra.

---

## ✨ Funcionalidades

### Gestión de directos

* Crear y administrar transmisiones.
* Generar códigos aleatorios para las prendas.
* Visualizar las prendas disponibles durante el directo.
* Registrar las ventas realizadas durante la transmisión.
* Cerrar un directo y consultar su información.

### Gestión de clientas

* Registrar clientas.
* Asociar nombres de usuario de TikTok.
* Registrar números de WhatsApp.
* Identificar clientas recurrentes.
* Agregar notas.
* Consultar el historial asociado a sus compras.

### Gestión de carritos

* Agrupar las prendas de una clienta dentro de un directo.
* Consultar el total acumulado.
* Consultar pagos realizados.
* Calcular saldo pendiente.
* Gestionar el estado de las prendas.

### Gestión de pagos

* Registrar pagos.
* Diferenciar tipos de pago.
* Asociar pagos con una clienta y un directo.
* Consultar el estado de los pagos.

### Gestión de entregas

* Registrar entregas.
* Asociar entregas con clientas y directos.
* Registrar tipo de entrega.
* Registrar costo de envío.
* Gestionar el estado de la entrega.
* Agregar observaciones.

### Catálogo público

El catálogo funciona independientemente del panel interno.

Las clientas pueden:

* Ver productos disponibles.
* Consultar fotografías.
* Consultar precios.
* Filtrar productos.
* Acumular productos.
* Obtener el total de su selección.
* Continuar la comunicación mediante WhatsApp.

No requiere registro ni inicio de sesión.

### Administración de productos

Permite gestionar el inventario utilizado por el catálogo:

* Crear productos.
* Editar productos.
* Eliminar productos.
* Administrar fotografías.
* Definir precio.
* Registrar talla.
* Clasificar productos.
* Gestionar disponibilidad.

---

## 🏗️ Arquitectura

El proyecto utiliza una estructura basada en **Next.js App Router**, separando páginas, componentes reutilizables, lógica auxiliar y acceso a Supabase.

```text
tiktok-live-manager/
│
├── app/
│   ├── acceso/
│   ├── admin/
│   │   └── productos/
│   ├── carritos/
│   ├── catalogo/
│   ├── cierre/
│   ├── clientes/
│   ├── dashboard/
│   ├── entregas/
│   ├── live/
│   ├── lives/
│   └── pagos/
│
├── components/
│   ├── auth/
│   ├── carts/
│   ├── cierre/
│   ├── clients/
│   ├── deliveries/
│   ├── layout/
│   ├── live/
│   ├── lives/
│   ├── payments/
│   └── ui/
│
├── lib/
│   ├── supabase/
│   └── utils/
│
├── public/
│
├── package.json
└── README.md
```

La aplicación se divide principalmente en dos áreas:

```text
                    TikTok Live Manager
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Operación interna            Catálogo público
             │                           │
      ┌──────┼──────┐                    │
      │      │      │                    │
    Lives Clientes Pagos             Productos
      │      │      │                    │
      └──────┼──────┘                    │
             │                           │
         Entregas                   WhatsApp
```

---

## 🗄️ Modelo de datos

La aplicación utiliza PostgreSQL mediante Supabase.

Las principales entidades son:

```text
customers
    │
    ├── items
    ├── payments
    └── deliveries
          │
          │
        lives
          │
          └── items

productos
```

### `customers`

Representa a las clientas que participan en las ventas.

Contiene información como:

* Nombre.
* Usuario de TikTok.
* WhatsApp.
* Estado.
* Notas.
* Indicador de clienta recurrente.

### `lives`

Representa cada transmisión en vivo.

Incluye:

* Título.
* Tipo de directo.
* Estado.
* Fecha de creación.

### `items`

Representa las prendas gestionadas dentro de un directo.

Incluye:

* Directo.
* Clienta.
* Código.
* Descripción.
* Precio.
* Estado.
* Tiempo de reserva.
* Requerimiento de primer pago.

### `payments`

Registra los pagos realizados por las clientas.

Incluye:

* Clienta.
* Directo.
* Tipo de pago.
* Importe.
* Estado.

### `deliveries`

Representa las entregas asociadas a una compra.

Incluye:

* Clienta.
* Directo.
* Tipo de entrega.
* Estado.
* Costo de envío.
* Observaciones.

### `productos`

Representa el inventario utilizado principalmente por el catálogo público.

Incluye:

* Nombre.
* Precio.
* Talla.
* Descripción.
* Fotografías.
* Categoría.
* Subcategoría.
* Estado.

---

## 🛠️ Tecnologías utilizadas

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**

### Backend y datos

* **Supabase**
* **PostgreSQL**
* **Supabase Storage**

### Desarrollo

* **ESLint**
* **Git**
* **npm**

---

## 🔐 Seguridad

La primera versión del proyecto utilizó un mecanismo sencillo de acceso mediante una contraseña y almacenamiento de sesión en el navegador.

Como parte de la evolución del proyecto, este mecanismo está siendo reemplazado por una arquitectura basada en:

* Supabase Auth.
* Row Level Security (RLS).
* Políticas de acceso a nivel de base de datos.
* Restricciones de integridad en PostgreSQL.
* Validación de reglas de negocio en el servidor/base de datos.

El objetivo es que la seguridad no dependa únicamente de la interfaz de usuario.

---

## 🔄 Flujo principal de venta

```text
Crear directo
     ↓
Generar código para la prenda
     ↓
Mostrar prenda durante el TikTok Live
     ↓
Una clienta gana la prenda
     ↓
Registrar clienta
     ↓
Asignar prenda a la clienta
     ↓
Crear/actualizar carrito
     ↓
Registrar pago
     ↓
Calcular saldo pendiente
     ↓
Cerrar directo
     ↓
Gestionar entrega
```

---

## 🌐 Catálogo público

El catálogo funciona como una segunda entrada al sistema.

```text
Clienta
   ↓
Catálogo
   ↓
Consulta productos
   ↓
Selecciona prendas
   ↓
Calcula total
   ↓
WhatsApp
```

No requiere autenticación porque está diseñado como una interfaz pública de consulta y selección.

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd tiktok-live-manager
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo:

```text
.env.local
```

con las variables necesarias para Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No subir `.env.local` al repositorio.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

---

## 📈 Estado del proyecto

**MVP funcional — en evolución.**

La aplicación ya cuenta con los principales flujos operativos, pero continúa en proceso de mejora.

### Implementado

* [x] Gestión de directos.
* [x] Generación de códigos.
* [x] Gestión de clientas.
* [x] Gestión de prendas.
* [x] Carritos.
* [x] Registro de pagos.
* [x] Gestión de entregas.
* [x] Catálogo público.
* [x] Integración con Supabase.
* [x] Almacenamiento de imágenes.

### En evolución

* [ ] Autenticación mediante Supabase Auth.
* [ ] Row Level Security.
* [ ] Restricciones de integridad en PostgreSQL.
* [ ] Transacciones para operaciones críticas.
* [ ] Control robusto de estados.
* [ ] Manejo uniforme de errores.
* [ ] Mejoras de concurrencia.
* [ ] Optimización de consultas.
* [ ] Limpieza automática de archivos no utilizados.
* [ ] Centralización de tipos.
* [ ] Documentación técnica de la base de datos.

---

## 🎯 Objetivo del proyecto

Más allá de resolver una necesidad concreta de gestión de ventas, este proyecto sirve como práctica para desarrollar una aplicación completa utilizando tecnologías modernas de desarrollo web.

Los principales objetivos técnicos son:

* Diseñar una aplicación basada en un problema real.
* Modelar información relacional con PostgreSQL.
* Integrar un frontend con una base de datos.
* Diseñar reglas de negocio.
* Implementar autenticación y autorización.
* Garantizar integridad de datos.
* Gestionar operaciones concurrentes.
* Aplicar buenas prácticas de desarrollo.
* Evolucionar un MVP hacia una aplicación más robusta.

---

## 👨‍💻 Autor

Proyecto desarrollado como iniciativa personal para resolver un problema real de gestión de ventas mediante transmisiones en vivo.

El proyecto se encuentra en desarrollo continuo y forma parte del proceso de aprendizaje práctico en desarrollo de software, bases de datos y diseño de sistemas.
