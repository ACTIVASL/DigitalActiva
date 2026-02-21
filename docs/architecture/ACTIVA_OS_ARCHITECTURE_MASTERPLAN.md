# MANIFIESTO DEL ARQUITECTO: ACTIVA OS (LA FÁBRICA DE EMPRESAS)
**Autor:** Ingeniero Principal (Senior Architect)
**Fecha:** 14 de Febrero de 2026
**Versión:** 1.0 (Masterplan)

---

## 1. INTRODUCCIÓN: LA TEORÍA DEL "MOLDE MAESTRO"

Como Arquitecto de Software con décadas de experiencia, mi misión no es construir una casa para ti. Mi misión es construir **un molde** que nos permita fabricar mil casas perfectas, donde cada dueño crea que la casa fue diseñada exclusivamente para él, aunque todas compartan los mismos cimientos, tuberías y muros de carga.

Lo que me pides es transformar **"Activa S.L."** (una casa única) en **"Activa OS"** (una constructora de rascacielos).

A continuación, detallo la ingeniería exacta de cómo organizaremos este código para que sea eterno, escalable y comercializable.

---

## 2. LA METÁFORA DE LA CASA: ESTRUCTURA VS. DECORACIÓN

Imagina que vamos a vender franquicias de un restaurante de lujo.
*   **El Código (Hardcode):** Son los muros de hormigón, la cocina industrial, el sistema de ventilación y la caja fuerte. Esto **NUNCA SE TOCA**. Si mueves un muro de carga, el edificio se cae.
*   **La Configuración (Softcode):** Es el color de las paredes, el uniforme de los camareros, el menú del día y el logo en la puerta. Esto **DEBE SER 100% CAMBIABLE** sin llamar al arquitecto.

### El Problema Actual
Hoy, si quieres cambiar el "Menú" (Tus servicios de Musicoterapia), tienes que picar piedra en los muros (editar el código `CorporateModel.ts`). Eso es caro y peligroso.

### La Solución: "Inyección de ADN"
Vamos a sacar todo lo que sea "Opinión" o "Identidad" fuera del código fuente y lo meteremos en un archivo de configuración externo (El ADN de la Empresa).

---

## 3. INGENIERÍA DE ORGANIZACIÓN DEL CÓDIGO (BLUEPRINT)

Para lograr que **Activa SL Corporate** y **Activa SL Digital** (y futuras empresas) convivan en el mismo código sin mezclarse, utilizaremos una arquitectura de **"Núcleo Limpio y Pieles Intercambiables"**.

### A. El Núcleo (The Engine) - `packages/engine-core`
Aquí vive la verdad absoluta. Código que es cierto para una clínica dental, un bufete de abogados o una empresa de musicoterapia.
*   **Lógica de "Empleados":** Todos tienen sueldo, rol y tareas.
*   **Lógica de "Canvas":** Siempre son cajas con títulos y KPIs.
*   **Lógica de "Login":** Siempre hay usuario y contraseña.

Este código es sagrado. Nadie lo toca para "personalizar". Es el motor del Ferrari.

### B. El Archivo de Configuración (The DNA) - `tenants/config.json`
Aquí es donde ocurre la magia. Definiremos un archivo JSON (Texto plano) que describe a la empresa. El software leerá este archivo al arrancar y se "disfrazará" de esa empresa.

**Ejemplo de ADN para Musicoterapia:**
```json
{
  "company_name": "Activa S.L.",
  "primary_color": "#blue",
  "departments": [
    { "id": "ops", "name": "Operaciones Clínicas", "icon": "Stethoscope" },
    { "id": "sales", "name": "Admisión de Pacientes", "icon": "Users" }
  ],
  "vocabulary": {
    "client": "Paciente",
    "service": "Sesión",
    "employee": "Musicoterapeuta"
  }
}
```

**Ejemplo de ADN para un Bufete de Abogados (Mismo código, diferente ADN):**
```json
{
  "company_name": "Legal Eagles S.L.",
  "primary_color": "#gold",
  "departments": [
    { "id": "ops", "name": "Litigios", "icon": "Scale" },
    { "id": "sales", "name": "Captación de Clientes", "icon": "Briefcase" }
  ],
  "vocabulary": {
    "client": "Cliente",
    "service": "Juicio",
    "employee": "Abogado"
  }
}
```

### C. El Panel Dinámico (The Chameleon Dashboard)
El Frontend (`apps/crm-client`) dejará de decir "Pacientes" de forma fija.
Ahora dirá: `{config.vocabulary.client}`.
*   Si entra el médico, leerá "Pacientes".
*   Si entra el abogado, leerá "Clientes".
*   Si entra el mecánico, leerá "Vehículos".

Esta es la clave de la escalabilidad. **No programamos palabras, programamos variables.**

---

## 4. GESTIÓN DE LA IDENTIDAD CORPORATIVA (Misión, Visión, Valores)

Me has pedido que "Misión, Visión y Valores" sean editables. Esto es vital porque define el alma de la empresa cliente.

### La Ingeniería de la "Cultura Ejecutable"
No trataremos la Misión/Visión como simple texto estático en una web. La trataremos como **Datos de Calibración de la IA**.

1.  **El Editor de Cultura:**
    Crearemos una sección en el panel "Admin" donde el CEO de la empresa cliente rellena:
    *   *Nuestra Misión:* "Curar a través de la música."
    *   *Nuestros Valores:* "Empatía, Ciencia, Rigor."

2.  **Inyección en Agentes (Prompt Engineering Dinámico):**
    Cuando un Agente de IA (ej. `ACTIVA-Ventas`) vaya a escribir un email, el sistema inyectará automáticamente esos valores en su cerebro.
    *   El Agente de Musicoterapia escribirá con "Empatía".
    *   El Agente del Bufete escribirá con "Firmeza y Ley".

**Resultado:** El software no solo cambia de color, cambia de **personalidad**.

---

## 5. ESTRATEGIA DE DEPLIEGUE (MULTI-TENANT)

¿Cómo gestionamos esto técnicamente para que no sea un caos?

### Paso 1: La Base de Datos Compartida pero Segregada
Usaremos una sola base de datos (Firestore), pero con **Tabiques de Acero**.

Estructura de la Base de Datos:
*   `/tenants/activa-sl/patients/...` (Datos de Activa)
*   `/tenants/bufete-perez/patients/...` (Datos del Bufete)
*   `/tenants/taller-manolo/patients/...` (Datos del Taller)

El código de seguridad (`firestore.rules`) garantizará que si tu usuario es `@activa-sl.com`, **jamás** pueda leer ni un byte de `@bufete-perez.com`. Es como vivir en un bloque de pisos: compartís edificio, pero tu llave no abre la puerta del vecino.

### Paso 2: El Dominio como Llave Maestra
*   El usuario entra en `panel.activa-sl.com` -> El sistema carga el ADN de Activa.
*   El usuario entra en `panel.bufete-perez.com` -> El sistema carga el ADN del Bufete.

Es el mismo código desplegado una sola vez. El navegador mira la URL y decide qué "traje" ponerse.

---

## 6. SÍNTESIS Y VISIÓN DE FUTURO

Lo que estamos construyendo aquí no es una web, es **Infraestructura**.
Al adoptar la arquitectura **"Activa OS"**, logramos tres hitos de ingeniería:

1.  **Velocidad de Venta:** Podemos desplegar una nueva empresa en 5 minutos. Solo necesitamos su Logo y su Configuración JSON.
2.  **Mantenimiento Cero:** Si arreglamos un bug en el calendario, se arregla automáticamente para Activa, para el Bufete y para el Taller a la vez. No hay que ir "casa por casa" arreglando grietas.
3.  **Valor de Mercado:** Un software "hardcoded" vale X. Un "SaaS White-Label Multi-Tenant" vale 100X, porque es una máquina de imprimir negocios.

Como Arquitecto Senior, esta es mi recomendación profesional: **Dejemos de construir casas a mano. Construyamos la fábrica.**
