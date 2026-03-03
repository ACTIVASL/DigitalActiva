import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { z } from 'zod';

// Configuración común eliminada ya que onDocumentCreated recibe su propia config.

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
    return onDocumentCreated({
        document: `m2m_tickets_${departmentId}/{ticketId}`,
        region: 'europe-west1',
        memory: '256MiB',
        timeoutSeconds: 30,
        maxInstances: 1
    }, async (event) => {
        console.log(`[EVENTARC] V2 Asynchronous Port Online: ${agentName} // M2M`);

        const snapshot = event.data;
        if (!snapshot) return;

        const data = snapshot.data();
        if (data.status === 'COMPLETED' || data.status === 'ERROR') return; // Evitar reconsumos

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

                // Finalizamos el ticket asíncrono
                await snapshot.ref.update({
                    status: 'COMPLETED',
                    message: `[${agentName}] Insight inyectado en ${departmentId}`,
                    insightId: insightId,
                    completedAt: FieldValue.serverTimestamp()
                });
            } else {
                await snapshot.ref.update({ status: 'ERROR', error: 'Acción M2M no soportada' });
            }
        } catch (error: any) {
            console.error(`[M2M Error] Port ${agentName}:`, error);
            await snapshot.ref.update({ status: 'ERROR', error: `[M2M_REJECTED]: ${error.message}` });
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
