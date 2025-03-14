# STORE FLOW

Store Flow es un proyecto que permite a los instructores del SENA realizar solicitudes de préstamo de elementos del almacén de manera automatizada. A continuación, se detalla toda la información técnica y organizativa necesaria para comprender, instalar y mantener este sistema.

---

## 📑 Tabla de Contenidos

1. [Nombre y Objetivo del Proyecto](#nombre-y-objetivo-del-proyecto)  
2. [Problema y Alcance](#problema-y-alcance)  
3. [Público Objetivo y Usuarios](#público-objetivo-y-usuarios)  
4. [Tecnologías y Herramientas](#tecnologias-y-herramientas)  
5. [Arquitectura del Sistema](#arquitectura-del-sistema)  
6. [Organización del Código y Módulos](#organizacion-del-codigo-y-modulos)  
7. [Requisitos Técnicos y Dependencias](#requisitos-tecnicos-y-dependencias)  
8. [Configuración, Instalación y Despliegue](#configuracion-instalacion-y-despliegue)  
9. [APIs e Integraciones](#apis-e-integraciones)  
10. [Mantenimiento y Soporte](#mantenimiento-y-soporte)  

---

## 1. Nombre y Objetivo del Proyecto

**Nombre:** **Store Flow**  
**Objetivo:**

Proporcionar una plataforma digital que permita a los instructores del SENA realizar solicitudes de préstamo de elementos del almacén de manera automatizada. 

Los usuarios podrán autenticarse mediante sus credenciales y generar solicitudes de préstamo, facilitando la gestión y coordinación con el personal encargado del almacén para la entrega física de los elementos. Cabe destacar que la creación y asignación de credenciales a cada usuario es gestionada por el Administrador.

---

## 2. Problema y Alcance

### 📌 Problema Actual
El proceso de solicitud de préstamo se realiza de forma manual mediante formularios físicos, lo que implica una mayor carga administrativa y la posibilidad de errores o demoras en la entrega de los elementos solicitados.

### 📌 Alcance
  - Automatizar la gestión de solicitud de préstamos para evitar el uso de formularios físicos.
  - Digitalizar el proceso para que los instructores realicen las solicitudes desde la plataforma.  
  - Agilizar la entrega de elementos y el control de inventario.  
  - Facilitar la supervisión por parte de administradores y personal de almacén.

---

## 3.  Público Objetivo y Usuarios

- **Público Objetivo:** SENA y su comunidad interna.
- **Usuarios del Sistema:**
  - :fa-user: **Administrador:** Configuración general y asignación de credenciales.
  - :fa-user: **Instructor:** Realiza solicitudes de préstamo.
  - :fa-user: **Personal de Almacén:** Valida y gestiona la entrega de los elementos.

---

## 4. Tecnologías y Herramientas

Store Flow se desarrolla utilizando las siguientes tecnologías y herramientas:

### Lenguajes de Programación y Frameworks:
- **JavaScript / TypeScript**: Para la lógica de negocio tanto en el frontend como en el backend.
- **Node.js**: Plataforma para el desarrollo del backend.
- **Angular**: Framework para el desarrollo del frontend.

### Diseño y Estilo:
- **HTML & CSS**: Para la estructuración y estilizado de las interfaces.
- **Bootstrap y Angular Material**: Librerías para el diseño responsivo y componentes de interfaz.

### Entorno de Desarrollo:
- **Visual Studio Code**: Editor de código principal.

---

## 5. Arquitectura del Sistema

La arquitectura del sistema se basa en el modelo **cliente-servidor**, estructurado de la siguiente manera:

### Componentes Principales:
- **Frontend (Cliente)**:  
  Desarrollado en **Angular**, se encarga de la interfaz de usuario y la comunicación con el backend a través de servicios **REST**.
- **Backend (Servidor)**:  
  Desarrollado en **Node.js**, expone **APIs** que gestionan la lógica de negocio, autenticación y comunicación con la base de datos.
- **Base de Datos**:  
  **MariaDB** se utiliza para almacenar la información relacionada con usuarios, solicitudes de préstamo y otros datos relevantes.

### Diagramas:
1. **Diagrama de Arquitectura del Sistema**

2. **Diagrama de Componentes**

3. **Diagrama de Flujo de Datos**

---

## 6. Organización del Código y Módulos

El proyecto se estructura en dos partes principales: **backend (Node.js)** y **frontend (Angular)**.  
Cada parte se organiza en carpetas que separan la lógica y funcionalidades del sistema, facilitando la **mantenibilidad** y **escalabilidad** del código.

---

### 📌 Backend (Node.js)

El código del backend se encuentra en la carpeta **`backend/src`**, con una estructura modular que separa la **lógica de negocio**, la **comunicación con la base de datos** y la **gestión de rutas**.

#### 📂 Estructura del Backend:
```
📂 backend/
│── 📂 node_modules/          # Dependencias de Node.js
│── 📂 src/
│   ├── 📂 config/            # Configuración del sistema (ej. conexión a la BD)
│   ├── 📂 controllers/       # Controladores que gestionan la lógica de negocio
│   ├── 📂 middleware/        # Middlewares para validaciones y seguridad
│   ├── 📂 models/            # Definición de esquemas de la base de datos
│   ├── 📂 routes/            # Definición de rutas y endpoints de la API REST
│   ├── 📂 utils/             # Funciones de utilidad y manejo de errores
│   ├── 📄 app.js             # Configuración principal del backend
│── 📄 .env                   # Variables de entorno
│── 📄 generarHash.js         # Generación de hash para contraseñas
│── 📄 package.json           # Archivo de dependencias del backend
│── 📄 server.js              # Punto de entrada del backend
```
```
📂 frontend/
│── 📂 node_modules/          # Dependencias de Angular
│── 📂 public/                # Recursos estáticos como imágenes
│── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 components/    # Componentes de la interfaz de usuario
│   │   ├── 📂 guards/        # Protección de rutas y validaciones
│   │   ├── 📂 models/        # Modelos de datos usados en la aplicación
│   │   ├── 📂 services/      # Servicios para la comunicación con el backend
│── .angular/              # Configuración de Angular
│── 📂 package.json           # Archivo de dependencias del frontend
```
---

## 7. Requisitos Técnicos y Dependencias

### Requisitos de Software

**Backend (Node.js + Express)**  
- Node.js: v20.17.0 (LTS recomendado)
- Gestor de paquetes: npm 11.0.0
- Servidor de base de datos: MariaDB (utilizado a través de XAMPP en entornos locales)

**Frontend**  
- Angular CLI: v19.2.0  
- Angular: v19.0.5  
- Navegador web (Chrome, Firefox, Edge, etc.)

### Dependencias Clave

## ✅ Backend (Node.js + Express)
El servidor utiliza Node.js con las siguientes librerías principales:

| 📦 Paquete            | 📌 Propósito                                      |
|----------------------|--------------------------------------------------|
| `express`           | Framework para la creación de APIs REST          |
| `body-parser`       | Procesamiento de datos en las solicitudes HTTP   |
| `cors`              | Permite la comunicación entre el frontend y backend |
| `dotenv`            | Gestión de variables de entorno                  |
| `joi`              | Validación de datos                               |
| `jsonwebtoken`      | Autenticación con JWT                            |
| `mysql2`           | Conexión con MariaDB                              |
| `nodemailer`       | Envío de correos electrónicos                     |
| `winston`          | Registro de logs en el sistema                    |

### 🛠️ Dependencias de Desarrollo (DevDependencies - Backend)
| 📦 Paquete  | 📌 Propósito                                  |
|------------|----------------------------------------------|
| `nodemon`  | Recarga automáticamente el servidor en desarrollo |

---

## ✅ Frontend (Angular + Material Design)
El cliente Angular incluye las siguientes dependencias clave:

| 📦 Paquete                         | 📌 Propósito                                            |
|------------------------------------|--------------------------------------------------------|
| `@angular/core`                    | Base del framework Angular                             |
| `@angular/material`                | Biblioteca de componentes UI de Angular               |
| `bootstrap`                         | Estilos y componentes responsivos                     |
| `@fortawesome/fontawesome-free`    | Iconos FontAwesome                                    |
| `ngx-toastr`                        | Notificaciones emergentes en la interfaz              |
| `rxjs`                              | Manejo de programación reactiva en Angular           |
| `localstorage-polyfill`             | Soporte para localStorage en entornos SSR            |
| `express`                           | Utilizado en el `serve:ssr` para el renderizado en servidor (SSR) |

### 🛠️ Dependencias de Desarrollo (DevDependencies - Frontend)
| 📦 Paquete                        | 📌 Propósito                                  |
|-----------------------------------|----------------------------------------------|
| `@angular-devkit/build-angular`   | Herramientas para compilar Angular         |
| `@angular/cli`                     | CLI para ejecutar comandos Angular         |
| `@types/node`                      | Definiciones de TypeScript para Node.js    |
| `typescript`                        | Lenguaje de programación usado en Angular  |
| `karma`, `jasmine-core`             | Librerías de testing para Angular         |

---

Con estas dependencias y herramientas, el proyecto **Store Flow** puede ejecutarse correctamente en los entornos de desarrollo y producción.

---

## 8. Configuración, Instalación y Despliegue

1. Clona el repositorio en tu máquina local:
```bash
git clone https://github.com/Quiomara/Store-Flow.git
```

2. Accede al repositorio clonado:
```bash
cd Store-Flow
```
3. Instale las dependencias correspondientes: <br>
**Backend (Node.js + Express)**
Ejecuta el siguiente comando dentro de la carpeta backend para instalar las dependencias necesarias:
```bash
npm install express body-parser cors dotenv joi jsonwebtoken mysql2 nodemailer winston
```
**Dependencias de Desarrollo (DevDependencies - Backend)**
```bash
npm install --save-dev nodemon
```
**Frontend (Angular)**
Accede a la carpeta frontend y ejecuta:
```bash
npm install @angular/material bootstrap ngx-toastr rxjs localstorage-polyfill
```
**Dependencias de Desarrollo (DevDependencies - Frontend)**
```bash
npm install --save-dev @angular-devkit/build-angular @angular/cli @types/node typescript karma jasmine-core
```
4. Descarga XAMPP desde su sitio oficial:
	[XAMPP](https://www.apachefriends.org/es/index.html)
	
5. Abre XAMPP y en el panel de control activa:
	✅ Apache (servidor web)
	✅ MySQL (base de datos)
	💡 Nota: Si tienes otro servicio usando el puerto 3306, cámbialo en la configuración de MySQL (archivo my.ini) o en el archivo de configuración del backend (.env).

6.  Configuración de la Base de Datos:
   6.1 Abre **phpMyAdmin** en tu navegador `http://localhost/phpmyadmin`.
   6.2 Haz clic en Bases de datos y crea una nueva base de datos con el nombre: `storeflowdb`.
   6.3 Selecciona la base de datos storeflowdb y haz clic en la pestaña Importar.
   6.4 Importa el archivo que se encuentra en el repositorio `storeflowdb.sql` en la pestaña **Importar**.
   6.5 Haz clic en Continuar para ejecutar la importación.

5. Variables de Entorno
Crear el archivo `.env` en `backend/` con:
```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=storeflowdb
JWT_SECRET=tu_clave_secreta
```

###  Ejecución del Proyecto
#### Backend:
```bash
npm run start
```
#### Frontend:
```bash
ng serve --proxy-config proxy.conf.json
```

**Accede a:** `http://localhost:4200/`

---

## 9. APIs e Integraciones

### 🔐 Autenticación
```http
POST /auth/login  # Iniciar sesión
POST /auth/reset-password  # Restablecer contraseña
```

### 📋 Gestión de Usuarios
```http
GET /usuarios  # Listar usuarios
POST /usuarios  # Registrar usuario
```

---

## 10. Mantenimiento y Soporte

- **Control de Versiones:** Git con ramas `master` y `develop`.
- **Gestión de Incidencias:** GitHub Issues.
- **Actualizaciones:** Documentadas en `README.md` y Wiki.
- **Soporte:** Vía Slack o correo.
- **Plan de Liberaciones:** Registro en `CHANGELOG.md`.

---

