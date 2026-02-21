# CRM ACTIVA OS (Titanium) — Propuesta de Upgrade

> **Documento de propuesta. NINGÚN código del CRM ha sido modificado.**
> Fecha: 2026-02-20

---

## 1. Estado Actual

El CRM ACTIVA OS es una aplicación React/TypeScript desplegada en Firebase con las siguientes capacidades:
- Gestión de pacientes/clientes (CRUD completo)
- Calendario de sesiones y citas
- Generación de informes PDF
- Autenticación Firebase + roles de usuario
- Dashboard tipo cockpit con vista centralizada
- Sistema de actividad/logging

## 2. Propuestas de Upgrade (Roadmap Futuro)

### 2.1 Analytics Dashboard
**Impacto**: Alto | **Complejidad**: Media
- KPIs en tiempo real: ingresos, retención, NPS
- Gráficos de tendencias (Chart.js o Recharts)
- Exportación automática de reportes semanales
- Comparativas mes a mes

### 2.2 Push Notifications
**Impacto**: Alto | **Complejidad**: Baja
- Firebase Cloud Messaging para notificaciones web
- Recordatorios de citas automáticos
- Alertas de actividad importante
- Soporte PWA (notificaciones nativas en móvil)

### 2.3 Offline Sync
**Impacto**: Medio | **Complejidad**: Alta
- Firestore offline persistence (ya soportado nativamente)
- Cola de escrituras pendientes con resolución de conflictos
- Indicador visual de estado online/offline
- Sincronización automática al recuperar conexión

### 2.4 Multi-Tenant Architecture
**Impacto**: Crítico (para escalabilidad B2B) | **Complejidad**: Alta
- Colecciones Firestore segmentadas por `tenantId`
- Panel de administración de tenants
- Facturación por tenant (Stripe integration)
- Aislamiento de datos con Security Rules

### 2.5 AI Insights (Gemini Integration)
**Impacto**: Diferenciador de mercado | **Complejidad**: Alta
- Gemini API para análisis de tendencias en datos clínicos/comerciales
- Sugerencias automáticas de acciones basadas en patrones
- Resúmenes ejecutivos generados por IA
- Evidence-Based: cada insight lleva trazabilidad de datos fuente

## 3. Prioridad Sugerida

| Prioridad | Upgrade | Justificación |
|-----------|---------|---------------|
| 1 | Push Notifications | Baja complejidad, alto impacto inmediato en retención |
| 2 | Analytics Dashboard | Valor percibido por CEO/decisores |
| 3 | Offline Sync | Diferenciador técnico para operarios en campo |
| 4 | Multi-Tenant | Necesario para escalar como SaaS B2B |
| 5 | AI Insights | Diferenciador de mercado a largo plazo |

## 4. Estimación de Esfuerzo

| Upgrade | Horas estimadas | Costo estimado |
|---------|----------------|----------------|
| Push Notifications | 20-30h | €2.000-3.000 |
| Analytics Dashboard | 40-60h | €4.000-6.000 |
| Offline Sync | 30-50h | €3.000-5.000 |
| Multi-Tenant | 80-120h | €8.000-12.000 |
| AI Insights | 60-100h | €6.000-10.000 |

---

> **Nota**: Este documento es una propuesta estratégica. La implementación requiere aprobación y planificación detallada antes de tocar cualquier código del CRM.
