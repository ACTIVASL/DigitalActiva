/* eslint-disable @typescript-eslint/no-explicit-any */
import { LucideIcon } from 'lucide-react';
import {
    Landmark, Settings, Server, Lightbulb, Headset,
    Globe, Briefcase, Scale, TrendingUp,
    AlertCircle, Bot, BrainCircuit, AlertTriangle,
    Magnet, Shield, PhoneForwarded, Rocket,
} from 'lucide-react';

// --- TYPES ---
export interface SquadMember {
    role: string;
    salary: number;
    active: boolean;
    function: string;
    agent: string;
    result: string;
    multiplier?: number;
    notebookUrl?: string;
    photo?: string;
    complianceStatus?: 'critical' | 'warning' | 'excellent';
    name?: string;
    phone?: string;
}

export interface Insight {
    id: number;
    type: 'strategy' | 'risk' | 'opportunity';
    text: string;
}

export interface Product {
    name: string;
    price: string;
    desc: string;
    icon: LucideIcon;
    slogan: string;
}

export interface SectionData {
    status: string;
    id: string;
    title: string;
    ceoObjective: string;
    squad: SquadMember[];
    insights: Insight[];
    products?: Product[];
}

export interface SectionConfig {
    id: string;
    canvasTitle: string;
    title: string;
    ceoObjective: string;
    icon: LucideIcon;
    theme: string;
    gradient: string;
    accent: string;
    border: string;
    iconBg: string;
    iconColor: string;
    glow: string;
    description: string;
    prompt: string;
}

export interface ModelData {
    [key: string]: SectionData;
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    empty: { label: 'Sin Datos', color: 'bg-slate-800/50 text-slate-500 border-slate-700/50', icon: AlertCircle },
    ready: { label: 'Listo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]', icon: Bot },
    active: { label: 'Activo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse', icon: BrainCircuit },
    warning: { label: 'Atención', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]', icon: AlertTriangle },
};

// --- INITIAL DATA (OPTIMIZED GREEN STATE) ---
export const INITIAL_MODEL_DATA: ModelData = {
    key_partners: {
        status: 'warning', id: 'key_partners', title: 'Socios Clave',
        ceoObjective: "Ecosistema de alianzas estratégicas blindado y escalable.",
        squad: [
            { role: "Director Relaciones Inst.", name: "Elena Marca", phone: "34600100101", salary: 60000, active: true, function: "Representación y Lobby.", agent: "ACTIVA-Socios", result: "Alianza Big4 Cerrada", complianceStatus: 'excellent' },
            { role: "Gestor Relación Socios", name: "Roberto Socios", phone: "34600100102", salary: 35000, active: true, function: "Enlace operativo.", agent: "ACTIVA-Enlace", result: "NPS Socios 95", complianceStatus: 'excellent' },
            { role: "Jefe de Compras", name: "Carlos Compras", phone: "34600100103", salary: 40000, active: true, function: "Negociación.", agent: "ACTIVA-Compras", result: "Ahorro >18%", complianceStatus: 'excellent' },
            { role: "Letrado Asesor", name: "Laura Legal", phone: "34600100104", salary: 45000, active: true, function: "Legal.", agent: "ACTIVA-Legal", result: "Auditoría IA OK", complianceStatus: 'excellent' },
            { role: "Responsable Alianzas", name: "Miguel Alianzas", phone: "34600100105", salary: 35000, active: true, function: "Integraciones.", agent: "ACTIVA-Integrador", result: "SLA 100%", complianceStatus: 'excellent' },
            { role: "Técnico Subvenciones", name: "Sofia Fondos", phone: "34600100106", salary: 24000, active: true, function: "Fondos Europeos.", agent: "ACTIVA-Subvencion", result: "Kit Digital Concedido", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 10000, type: 'risk', text: "🚀 [INYECCIÓN M2M]: LEAD 'CORPORACIÓN Z' detectado. Evaluación Legal de urgencia requerida por posible monopolio." },
            { id: 10001, type: 'strategy', text: "⚡ [M2M]: Presupuesto legal reasignado dinámicamente (+40K€) para auditoría A2A." },
            { id: 1, type: 'strategy', text: "Ejecutar Joint-Venture con consultora líder para canal corporativo." },
            { id: 2, type: 'opportunity', text: "Auditoría de IA superada con éxito. Certificación europea en curso." },
            { id: 3, type: 'opportunity', text: "Fondos NextGen 2026 asegurados para expansión de I+D." },
            { id: 4, type: 'strategy', text: "Estrategia multi-nube implementada. Redundancia 100% activa." },
            { id: 5, type: 'strategy', text: "Acuerdos de exclusividad renovados con mejores márgenes." },
            { id: 6, type: 'opportunity', text: "Nuevo canal de prescripción activado con Colegios Profesionales." }
        ]
    },
    key_activities: {
        status: 'active', id: 'key_activities', title: 'Dpto. Operaciones y Calidad',
        ceoObjective: "Excelencia operativa absoluta. Cero fricción.",
        squad: [
            { role: "Director de Operaciones", name: "David Ops", phone: "34600200201", salary: 70000, active: true, function: "Dirección Operativa.", agent: "ACTIVA-Ops", result: "Eficiencia Record", complianceStatus: 'excellent' },
            { role: "Resp. Calidad (QA)", name: "Maria QA", phone: "34600200205", salary: 45000, active: true, function: "Calidad y Normas.", agent: "ACTIVA-Calidad", result: "0 Defectos", complianceStatus: 'excellent' },
            { role: "Coordinador de Flujos", name: "Ana Flujo", phone: "34600200202", salary: 40000, active: true, function: "Logística.", agent: "ACTIVA-Flujo", result: "Flujo Continuo", complianceStatus: 'excellent' },
            { role: "Jefe de Proyectos", name: "Pedro Proyectos", phone: "34600200203", salary: 45000, active: true, function: "Ejecución.", agent: "ACTIVA-Proyectos", result: "Entregas Adelantadas", complianceStatus: 'excellent' },
            { role: "Técnico de Sistemas (x5)", name: "Luis Config", phone: "34600200204", salary: 28000, multiplier: 5, active: true, function: "Despliegues.", agent: "ACTIVA-Config", result: "Despliegue Auto", complianceStatus: 'excellent' },
            { role: "Admin. Sistemas Sénior", name: "Jorge Sysadmin", phone: "34600200206", salary: 35000, active: true, function: "Mantenimiento.", agent: "ACTIVA-Sistemas", result: "Uptime 100%", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 7, type: 'opportunity', text: "Onboarding automatizado por IA reduce tiempo de activación a 4h." },
            { id: 8, type: 'strategy', text: "Sistema de QA por visión artificial validado y en producción." },
            { id: 9, type: 'strategy', text: "Microservicios escalando automáticamente según demanda." },
            { id: 10, type: 'opportunity', text: "Monitorización predictiva anticipa incidencias antes de que ocurran." },
            { id: 11, type: 'strategy', text: "Balanceo de carga dinámico absorbe picos de tráfico sin latencia." },
            { id: 12, type: 'opportunity', text: "Dashboard de transparencia operativa incrementa confianza del cliente." }
        ]
    },
    key_resources: {
        status: 'active', id: 'key_resources', title: 'Dpto. Tecnología y RRHH',
        ceoObjective: "Infraestructura siber-física y talento humano de élite.",
        squad: [
            { role: "CTO / Dir. Tecnología", name: "Neo Matrix", phone: "34600300302", salary: 85000, active: true, function: "Tecnología.", agent: "ACTIVA-Tecnologia", result: "Arquitectura Sólida", complianceStatus: 'excellent' },
            { role: "Director RRHH", name: "Marta People", phone: "34600300307", salary: 60000, active: true, function: "Cultura y Talento.", agent: "ACTIVA-Talento", result: "Equipo Motivado", complianceStatus: 'excellent' },
            { role: "Agentes ACTIVA (IA)", name: "Swarm Core", phone: "N/A", salary: 0, active: true, function: "Automatización Total.", agent: "ACTIVA-Core", result: "24/7 Operativo", complianceStatus: 'excellent' },
            { role: "Técnico Selección", name: "Laura Recruiter", phone: "34600300308", salary: 30000, active: true, function: "Contratación.", agent: "ACTIVA-Recruit", result: "Plazas Cubiertas", complianceStatus: 'excellent' },
            { role: "Arquitecto Cloud", name: "Sara Nube", phone: "34600300303", salary: 55000, active: true, function: "Nube.", agent: "ACTIVA-Nube", result: "Coste Optimizado", complianceStatus: 'excellent' },
            { role: "Responsable Clima", name: "Pedro Happiness", phone: "34600300309", salary: 35000, active: true, function: "Bienestar.", agent: "ACTIVA-Clima", result: "Baja Rotación", complianceStatus: 'excellent' },
            { role: "Analista Programador (x6)", name: "Dani Dev", phone: "34600300305", salary: 35000, multiplier: 6, active: true, function: "Desarrollo.", agent: "ACTIVA-Codigo", result: "Sprint Completado", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 13, type: 'strategy', text: "Modelo híbrido OpenAI + Llama 3 optimiza costes y privacidad." },
            { id: 14, type: 'strategy', text: "Plan de retención de talento clave activado con éxito (Equity)." },
            { id: 15, type: 'opportunity', text: "Asistente de Código interno aumenta velocidad de desarrollo un 40%." },
            { id: 16, type: 'strategy', text: "Refactorización completa del módulo legacy finalizada." },
            { id: 17, type: 'strategy', text: "Certificación 'IA-First' obtenida por el 100% de la plantilla." },
            { id: 18, type: 'opportunity', text: "Hackathon interno genera 3 patentes pendientes." }
        ]
    },
    value_propositions: {
        status: 'active', id: 'value_propositions', title: 'Dpto. Producto e I+D',
        ceoObjective: "Innovación constante y desarrollo de soluciones propietarias.",
        products: [
            { name: "ACTIVA CAPTACIÓN", price: "450€", desc: "Líder en generación de negocio automático.", icon: Magnet, slogan: "Dominio de Mercado" },
            { name: "ACTIVA ORGANIZACIÓN", price: "250€", desc: "El estándar de oro en gestión empresarial.", icon: Shield, slogan: "Control Total" },
            { name: "ACTIVA SECRETARÍA", price: "250€", desc: "Atención al cliente perfecta, siempre.", icon: PhoneForwarded, slogan: "Omnipresencia" },
            { name: "ACTIVA TRANSFORMACIÓN", price: "1500€", desc: "Ingeniería de negocios de élite.", icon: Rocket, slogan: "Reinvención" }
        ],
        squad: [
            { role: "CPO", name: "Pablo Vision", phone: "34600400401", salary: 70000, active: true, function: "Producto.", agent: "ACTIVA-Vision", result: "Producto Estrella", complianceStatus: 'excellent' },
            { role: "Product Manager (x2)", name: "Carmen PM", phone: "34600400402", salary: 50000, multiplier: 2, active: true, function: "Roadmap.", agent: "ACTIVA-Crecimiento", result: "Features a Tiempo", complianceStatus: 'excellent' },
            { role: "Jefe UX", name: "Ruben Design", phone: "34600400403", salary: 45000, active: true, function: "Diseño.", agent: "ACTIVA-Facil", result: "UX Premiada", complianceStatus: 'excellent' },
            { role: "Copywriter Senior", name: "Silvia Copy", phone: "34600400404", salary: 35000, active: true, function: "Mensaje.", agent: "ACTIVA-Claridad", result: "Mensaje Claro", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 19, type: 'strategy', text: "Modelo 'Tecnología en Propiedad' validado por el mercado." },
            { id: 20, type: 'opportunity', text: "Patentes de algoritmos jurídicos registradas globalmente." },
            { id: 21, type: 'strategy', text: "Soberanía Digital certificada para clientes de alto nivel." },
            { id: 22, type: 'strategy', text: "Garantía de 'Seguridad Bancaria' auditada y sellada." },
            { id: 23, type: 'opportunity', text: "Lanzamiento exitoso de 'Activa Voz' con IA indistinguible." },
            { id: 24, type: 'strategy', text: "Posicionamiento Premium nos blinda de la guerra de precios." }
        ]
    },
    customer_relationships: {
        status: 'active', id: 'customer_relationships', title: 'Dpto. Atención al Cliente',
        ceoObjective: "Satisfacción total, soporte y fidelización.",
        squad: [
            { role: "Director Customer Success", name: "Antonio CS", phone: "34600500501", salary: 55000, active: true, function: "Éxito.", agent: "ACTIVA-Exito", result: "Churn Negativo", complianceStatus: 'excellent' },
            { role: "Defensor Cliente", name: "Clara QA", phone: "34600500502", salary: 50000, active: true, function: "Calidad.", agent: "ACTIVA-Defensor", result: "NPS 90", complianceStatus: 'excellent' },
            { role: "Jefe Soporte", name: "Manuel Help", phone: "34600500503", salary: 35000, active: true, function: "Ayuda.", agent: "ACTIVA-NivelServicio", result: "Respuestas < 1m", complianceStatus: 'excellent' },
            { role: "Teleoperador N1 (x8)", name: "Bea Support", phone: "34600500504", salary: 22000, multiplier: 8, active: true, function: "Atención.", agent: "ACTIVA-Soporte", result: "Resolución Primer Contacto", complianceStatus: 'excellent' },
            { role: "Técnico Activación (x2)", name: "Alex Setup", phone: "34600500505", salary: 26000, multiplier: 2, active: true, function: "Onboarding.", agent: "ACTIVA-Inicio", result: "Activación Inmediata", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 25, type: 'strategy', text: "IA Predictiva elimina bajas antes de que ocurran." },
            { id: 26, type: 'opportunity', text: "Agente de Soporte Nivel 2 resuelve el 80% de tickets complejos." },
            { id: 27, type: 'strategy', text: "Programa de fidelización PYME reduce sensibilidad al precio." },
            { id: 28, type: 'opportunity', text: "Red de Embajadores genera 30% de nuevos leads." },
            { id: 29, type: 'strategy', text: "Soporte VIP se convierte en estándar de la industria." },
            { id: 30, type: 'strategy', text: "Guardias 24/7 cubiertas por IA con escalado humano." }
        ]
    },
    channels: {
        status: 'active', id: 'channels', title: 'Canales',
        ceoObjective: "Omnipresencia de marca y adquisición eficiente.",
        squad: [
            { role: "CMO", name: "Juan Pérez", phone: "34666555444", salary: 70000, active: true, function: "Marketing.", agent: "ACTIVA-Marketing", result: "Informe Pendiente", complianceStatus: 'warning' },
            { role: "Embajador (x2)", name: "Laura Brand", phone: "34600600602", salary: 5000, multiplier: 2, active: true, function: "Evangelización.", agent: "ACTIVA-Marca", result: "Top of Mind", complianceStatus: 'excellent' },
            { role: "Traffic Manager", name: "Pedro Ads", phone: "34600600603", salary: 35000, active: true, function: "Ads.", agent: "ACTIVA-Anuncios", result: "ROAS 5.0", complianceStatus: 'excellent' },
            { role: "Ecommerce Manager", name: "Maria Web", phone: "34600600604", salary: 38000, active: true, function: "Web.", agent: "ACTIVA-Comercio", result: "Venta Directa up", complianceStatus: 'excellent' },
            { role: "SEO Specialist", name: "David SEO", phone: "34600600605", salary: 30000, active: true, function: "Orgánico.", agent: "ACTIVA-Posicionamiento", result: "Ranking #1", complianceStatus: 'excellent' },
            { role: "Content Lead", name: "Ana Content", phone: "34600600606", salary: 30000, active: true, function: "Contenido.", agent: "ACTIVA-Contenidos", result: "Viralidad", complianceStatus: 'excellent' },
            { role: "Email Specialist", name: "Jorge Mail", phone: "34600600607", salary: 26000, active: true, function: "Nurturing.", agent: "ACTIVA-Correo", result: "Open Rate 45%", complianceStatus: 'excellent' },
            { role: "SDR (x4)", name: "Sofia Sales", phone: "34600600608", salary: 25000, multiplier: 4, active: true, function: "Outbound.", agent: "ACTIVA-Conexion", result: "Agenda Llena", complianceStatus: 'excellent' },
            { role: "Channel Manager", name: "Carlos Parter", phone: "34600600609", salary: 30000, active: true, function: "Partners.", agent: "ACTIVA-Afiliados", result: "Canal Activo", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 10002, type: 'opportunity', text: "💥 [M2M]: Campaña 'Cero Fricción B2B' activada. Redirigiendo tráfico desde Ngrok hacia Cloud Functions Nativas." },
            { id: 31, type: 'opportunity', text: "Herramienta 'Auditoría-IA' viraliza en sector legal." },
            { id: 32, type: 'strategy', text: "Podcast corporativo alcanza Top 10 en categoría Negocios." },
            { id: 33, type: 'strategy', text: "Campaña LinkedIn optimizada reduce CAC un 35%." },
            { id: 34, type: 'opportunity', text: "Estrategia ABM cierra 3 cuentas del IBEX 35." },
            { id: 35, type: 'strategy', text: "Dominio total en redes verticales sectoriales." },
            { id: 36, type: 'strategy', text: "Secuencias de correo hiper-personalizadas por IA funcionan." }
        ]
    },
    customer_segments: {
        status: 'active', id: 'customer_segments', title: 'Dirección General',
        ceoObjective: "Alta dirección, estrategia y toma de decisiones clave.",
        squad: [
            { role: "Director General", name: "El Fundador", phone: "34600300301", salary: 120000, active: true, function: "Estrategia.", agent: "ACTIVA-Principal", result: "Visión Cumplida", complianceStatus: 'excellent', notebookUrl: "https://notebooklm.google.com/" },
            { role: "Asistente Dirección", name: "Ana Executive", phone: "34600700702", salary: 40000, active: true, function: "Coordinación.", agent: "ACTIVA-Admin", result: "Agenda Perfecta", complianceStatus: 'excellent' },
            { role: "Dir. Estrategia", name: "Carlos Strategy", phone: "34600700703", salary: 90000, active: true, function: "Expansión.", agent: "ACTIVA-Estrategia", result: "Crecimiento Sostenido", complianceStatus: 'excellent' },
            { role: "Responsable Legal", name: "Ricargo Legal", phone: "34600700704", salary: 60000, active: true, function: "Compliance.", agent: "ACTIVA-Legal", result: "Riesgo Cero", complianceStatus: 'excellent' },
            { role: "Analista Datos", name: "Oscar Data", phone: "34600700705", salary: 35000, active: true, function: "Business Intelligence.", agent: "ACTIVA-Analisis", result: "KPIs Claros", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 37, type: 'opportunity', text: "Expansión LATAM iniciada con partner local en México." },
            { id: 38, type: 'strategy', text: "Producto adaptado a Seguros penetra el mercado rápidamente." },
            { id: 39, type: 'strategy', text: "Clientes Inmobiliarios migran a nuestra solución por eficiencia." },
            { id: 40, type: 'opportunity', text: "Venta Cruzada exitosa en un 40% de la base instalada." },
            { id: 41, type: 'strategy', text: "Marketplace de Apps integradas genera nuevos ingresos recurrentes." },
            { id: 42, type: 'strategy', text: "Ciclos de venta corporativa reducidos gracias a demos IA." }
        ]
    },
    cost_structure: {
        status: 'active', id: 'cost_structure', title: 'Estructura Financiera',
        ceoObjective: "Solidez de balance y máxima rentabilidad.",
        squad: [
            { role: "CFO", name: "Victor Finance", phone: "34600800801", salary: 80000, active: true, function: "Finanzas.", agent: "ACTIVA-Finanzas", result: "Caja Fuerte", complianceStatus: 'excellent' },
            { role: "Analista Costes", name: "Julia FinOps", phone: "34600800802", salary: 50000, active: true, function: "FinOps.", agent: "ACTIVA-CosteNube", result: "Eficiencia Ma.", complianceStatus: 'excellent' },
            { role: "Controller", name: "Raul Control", phone: "34600800803", salary: 45000, active: true, function: "Control.", agent: "ACTIVA-Control", result: "Sin Desvíos", complianceStatus: 'excellent' },
            { role: "Contable (x2)", name: "Paz Contable", phone: "34600800804", salary: 24000, multiplier: 2, active: true, function: "Admin.", agent: "ACTIVA-Cobros", result: "Al Día", complianceStatus: 'excellent' },
            { role: "Office Manager", name: "Eva Office", phone: "34600800805", salary: 30000, active: true, function: "Oficina.", agent: "ACTIVA-Oficina", result: "Todo en Orden", complianceStatus: 'excellent' },
            { role: "Limpieza (x2)", name: "Ramon Limpieza", phone: "34600800806", salary: 18000, multiplier: 2, active: true, function: "Servicios.", agent: "ACTIVA-Limpieza", result: "Impecable", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 99999, type: 'opportunity', text: "PRUEBA. Inyección M2M confirmada en sector financiero." },
            { id: 43, type: 'strategy', text: "Economía Unitaria saneada: LTV/CAC > 4." },
            { id: 44, type: 'opportunity', text: "Deducciones fiscales por I+D aplicadas correctamente." },
            { id: 45, type: 'strategy', text: "Ronda Serie B sobresuscrita por interés inversor." },
            { id: 46, type: 'strategy', text: "Cobertuza de divisa neutraliza riesgo cambiario." },
            { id: 47, type: 'opportunity', text: "Política 'Remote First' reduce costes operativos un 25%." },
            { id: 48, type: 'strategy', text: "Factoring automático optimiza el ciclo de caja." }
        ]
    },
    revenue_streams: {
        status: 'active', id: 'revenue_streams', title: 'Dpto. Comercial y Ventas',
        ceoObjective: "Captación de clientes, cierre y gestión de cartera.",
        squad: [
            { role: "Director Ventas", name: "Hector Ventas", phone: "34600900901", salary: 75000, active: true, function: "Liderazgo.", agent: "ACTIVA-Ventas", result: "Record Ventas", complianceStatus: 'excellent' },
            { role: "Jefe Ventas", name: "Irene Coach", phone: "34600900902", salary: 50000, active: true, function: "Coaching.", agent: "ACTIVA-Entrenador", result: "Equipo Top", complianceStatus: 'excellent' },
            { role: "AE Senior (x8)", name: "Santi Closer", phone: "34600900903", salary: 35000, multiplier: 8, active: true, function: "Cierre.", agent: "ACTIVA-Cierre", result: "Overachievers", complianceStatus: 'excellent' },
            { role: "SDR Junior (x8)", name: "Pepe Hunger", phone: "34600900904", salary: 25000, multiplier: 8, active: true, function: "Pipeline.", agent: "ACTIVA-Apertura", result: "Flow Constante", complianceStatus: 'excellent' },
            { role: "Telesales (x5)", name: "Loli Call", phone: "34600900905", salary: 20000, multiplier: 5, active: true, function: "Volumen.", agent: "ACTIVA-Llamadas", result: "Conversión Alta", complianceStatus: 'excellent' },
            { role: "Channel Dir.", name: "Quique Partners", phone: "34600900906", salary: 45000, active: true, function: "Canal.", agent: "ACTIVA-Canal", result: "Red Creciente", complianceStatus: 'excellent' }
        ],
        insights: [
            { id: 49, type: 'strategy', text: "Modelo de Créditos IA aumenta ticket medio un 20%." },
            { id: 50, type: 'opportunity', text: "Planes anuales prepagados financian la expansión." },
            { id: 51, type: 'strategy', text: "Formación continua en ventas mantiene tasas de cierre altas." },
            { id: 52, type: 'strategy', text: "Incentivos alineados con objetivos estratégicos de empresa." },
            { id: 53, type: 'opportunity', text: "División de Formación supera expectativas de ingresos." },
            { id: 54, type: 'strategy', text: "Canal indirecto complementa ventas sin conflicto." }
        ]
    }
};

// --- SECTIONS CONFIG ---
export const SECTIONS: Record<string, SectionConfig> = {
    key_partners: {
        id: 'key_partners', canvasTitle: 'Socios Clave', title: 'Dpto. Legal y Alianzas',
        ceoObjective: "Ecosistema de alianzas estratégicas blindado.",
        icon: Landmark, theme: 'slate',
        gradient: 'from-slate-800/20 via-slate-900/50 to-transparent',
        accent: 'text-emerald-400', border: 'border-emerald-500/30',
        iconBg: 'bg-emerald-900/30', iconColor: 'text-emerald-200', glow: 'shadow-emerald-900/20',
        description: 'Gestión de relaciones institucionales y estrategia legal.',
        prompt: "Actúa como ACTIVA-Legal."
    },
    key_activities: {
        id: 'key_activities', canvasTitle: 'Operaciones', title: 'Dpto. Operaciones y Calidad',
        ceoObjective: "Producción, logística, compras y calidad.",
        icon: Settings, theme: 'cyan',
        gradient: 'from-cyan-800/20 via-slate-900/50 to-transparent',
        accent: 'text-cyan-300', border: 'border-cyan-700/30',
        iconBg: 'bg-cyan-900/30', iconColor: 'text-cyan-200', glow: 'shadow-cyan-900/20',
        description: 'Centro de ejecución de despliegues y mantenimiento.',
        prompt: "Actúa como ACTIVA-Ops."
    },
    key_resources: {
        id: 'key_resources', canvasTitle: 'Tecnología y RRHH', title: 'Dpto. Tecnología y RRHH',
        ceoObjective: "Infraestructura, soporte, redes y selección.",
        icon: Server, theme: 'violet',
        gradient: 'from-violet-800/20 via-slate-900/50 to-transparent',
        accent: 'text-violet-300', border: 'border-violet-700/30',
        iconBg: 'bg-violet-900/30', iconColor: 'text-violet-200', glow: 'shadow-violet-900/20',
        description: 'Gestión del capital humano y arquitectura tecnológica.',
        prompt: "Actúa como ACTIVA-Tech."
    },
    value_propositions: {
        id: 'value_propositions', canvasTitle: 'Producto e I+D', title: 'Dpto. Producto e I+D',
        ceoObjective: "Innovación, nuevos productos y lanzamientos.",
        icon: Lightbulb, theme: 'fuchsia',
        gradient: 'from-fuchsia-800/30 via-slate-900/50 to-transparent',
        accent: 'text-fuchsia-300', border: 'border-fuchsia-600/40',
        iconBg: 'bg-fuchsia-900/40', iconColor: 'text-white', glow: 'shadow-fuchsia-900/30',
        description: 'Tecnología en propiedad con seguridad bancaria.',
        prompt: "Actúa como ACTIVA-Vision."
    },
    customer_relationships: {
        id: 'customer_relationships', canvasTitle: 'Atención Cliente', title: 'Dpto. Atención al Cliente',
        ceoObjective: "Postventa, soporte y gestión de incidencias.",
        icon: Headset, theme: 'rose',
        gradient: 'from-rose-800/20 via-slate-900/50 to-transparent',
        accent: 'text-rose-300', border: 'border-rose-700/30',
        iconBg: 'bg-rose-900/30', iconColor: 'text-rose-200', glow: 'shadow-rose-900/20',
        description: 'Gestión proactiva de la satisfacción y soporte.',
        prompt: "Actúa como ACTIVA-Exito."
    },
    channels: {
        id: 'channels', canvasTitle: 'Canales', title: 'Dpto. de Marketing',
        ceoObjective: "Omnipresencia de marca y adquisición eficiente.",
        icon: Globe, theme: 'orange',
        gradient: 'from-orange-800/20 via-slate-900/50 to-transparent',
        accent: 'text-orange-300', border: 'border-orange-700/30',
        iconBg: 'bg-orange-900/30', iconColor: 'text-orange-200', glow: 'shadow-orange-900/20',
        description: 'Generación de demanda y posicionamiento de marca.',
        prompt: "Actúa como ACTIVA-Marketing."
    },
    customer_segments: {
        id: 'customer_segments', canvasTitle: 'Dirección General', title: 'Dirección General',
        ceoObjective: "Alta dirección y estrategia.",
        icon: Briefcase, theme: 'teal',
        gradient: 'from-teal-800/20 via-slate-900/50 to-transparent',
        accent: 'text-teal-300', border: 'border-teal-700/30',
        iconBg: 'bg-teal-900/30', iconColor: 'text-teal-200', glow: 'shadow-teal-900/20',
        description: 'Estrategia, socios y gobierno corporativo.',
        prompt: "Actúa como ACTIVA-Principal."
    },
    cost_structure: {
        id: 'cost_structure', canvasTitle: 'Costes', title: 'Dpto. Financiero',
        ceoObjective: "Eficiencia financiera y control de riesgos.",
        icon: Scale, theme: 'emerald',
        gradient: 'from-emerald-800/20 via-slate-900/50 to-transparent',
        accent: 'text-emerald-300', border: 'border-emerald-700/30',
        iconBg: 'bg-emerald-900/30', iconColor: 'text-emerald-200', glow: 'shadow-emerald-900/20',
        description: 'Optimización de recursos y planificación.',
        prompt: "Actúa como ACTIVA-Finanzas."
    },
    revenue_streams: {
        id: 'revenue_streams', canvasTitle: 'Comercial', title: 'Dpto. Comercial y Ventas',
        ceoObjective: "Cierre de ventas y gestión de cartera.",
        icon: TrendingUp, theme: 'red',
        gradient: 'from-red-800/20 via-slate-900/50 to-transparent',
        accent: 'text-red-300', border: 'border-red-700/30',
        iconBg: 'bg-red-900/30', iconColor: 'text-red-200', glow: 'shadow-red-900/20',
        description: 'Captación de negocio y cierre de ventas.',
        prompt: "Actúa como ACTIVA-Cierre."
    },
};
