import { onCall, HttpsOptions } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const FUNCTION_OPTS: HttpsOptions = {
    region: 'europe-west1',
    memory: '256MiB', // Bajo consumo, alta velocidad M2M
    timeoutSeconds: 30, // Corto: operaciones atómicas
    cors: true,
    invoker: 'public', // Permite que cloud_strike (un script externo) llame a la función sin auth IAM GCP
    maxInstances: 1, // EVITA "Quota exceeded for CPU per project per region"
};

// --- VALIDACIÓN DE ENTRADA BASE ---
const AgentPayloadSchema = z.object({
    action: z.enum(['INSIGHT_ADD', 'INSIGHT_REMOVE', 'STATUS_UPDATE']),
    payload: z.record(z.any()), // Dependerá del insight pero sanitizado
    authSignature: z.string().optional() // Para futuras integraciones de tokens
});

/**
 * 🏭 M2M SWARM: LOS 9 PUERTOS DE ACOPLAMIENTO DE AGENTES (Zero DOM Latency)
 * Cada departamento del Strategic Canvas de Activa S.L. tiene su propio
 * puerto de atraque para un Agente IA. Aísla fallos y paraleliza la carga.
 */

const createAgentPort = (departmentId: string, agentName: string) => {
    return onCall(FUNCTION_OPTS, async (request) => {
        console.log(`[FIREBASE_CACHE_BUSTER] V2 Public Invoker Online: ${agentName} // M2M`);
        // En un entorno de Producción Enterprise, se valida if (!request.auth) o token
        const data = request.data;

        try {
            // Pilar 3: Blindaje Zod
            const parsed = AgentPayloadSchema.parse(data);
            const db = getFirestore();

            // Acceso atómico al documento principal del Canvas
            const canvasRef = db.collection('system_context').doc('master_canvas');

            if (parsed.action === 'INSIGHT_ADD') {
                const insightId = Date.now();
                const updatePayload: Record<string, any> = {};

                // Actualización anidada
                updatePayload[`${departmentId}.insights`] = FieldValue.arrayUnion({
                    id: insightId,
                    type: parsed.payload.type || 'strategy',
                    text: parsed.payload.text,
                    _m2mSource: agentName
                });

                await canvasRef.update(updatePayload);
                return { success: true, message: `[${agentName}] Insight inyectado en ${departmentId}`, insightId };
            }

            return { success: false, error: 'Acción M2M no soportada' };
        } catch (error: any) {
            console.error(`[M2M Error] Port ${agentName}:`, error);
            throw new Error(`[M2M_REJECTED] Payload Formatting Error: ${error.message}`);
        }
    });
};

// --- LA MATRIZ DE LOS 9 DEPARTAMENTOS ---

// 1. Dpto. Legal y Alianzas (Socios Clave)
export const agentLegalV2 = createAgentPort('key_partners', 'ACTIVA-Legal');

// 2. Dpto. Operaciones y Calidad (Actividades Clave)
export const agentOpsV2 = createAgentPort('key_activities', 'ACTIVA-Ops');

// 3. Dpto. Tecnología y RRHH (Recursos Clave)
export const agentTechV2 = createAgentPort('key_resources', 'ACTIVA-Tech');

// 4. Dpto. Producto e I+D (Propuestas de Valor)
export const agentProductV2 = createAgentPort('value_propositions', 'ACTIVA-Product');

// 5. Dpto. Atención al Cliente (Relaciones)
export const agentSupportV2 = createAgentPort('customer_relationships', 'ACTIVA-Support');

// 6. Dpto. de Marketing (Canales)
export const agentMarketingV2 = createAgentPort('channels', 'ACTIVA-Marketing');

// 7. Dpto. Comercial y Ventas (Segmentos)
export const agentSalesV2 = createAgentPort('customer_segments', 'ACTIVA-Sales');

// 8. Dpto. Financiero (Estructura de Costes)
export const agentFinanceV2 = createAgentPort('cost_structure', 'ACTIVA-Finance');

// 9. Dirección General (Flujos de Ingresos y Estrategia Global)
export const agentDirectorV2 = createAgentPort('revenue_streams', 'ACTIVA-DireccionCore');
