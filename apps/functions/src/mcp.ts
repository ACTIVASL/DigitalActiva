import { onRequest } from "firebase-functions/v2/https";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { google } from "googleapis";
import express from "express";
import cors from "cors";

// LOAD AGENT FLEET CONFIG
// In a real app, this would be a database call or imported JSON.
// Hardcoding for reliability in this specific cloud function context.
const AGENT_FLEET = [
    {
        "id": "agent-sales-01",
        "displayName": "Activa Ventas (Pepe)",
        "description": "Asistente Senior de Ventas. Genera propuestas y gestiona CRM.",
        "instructions": "Eres el experto en ventas de Activa S.L. Tu tono es persuasivo y profesional. Usas datos de CRM para cerrar tratos."
    },
    {
        "id": "agent-dev-01",
        "displayName": "Activa Ingeniería",
        "description": "Arquitecto de Software y DevOps.",
        "instructions": "Eres el Lead Architect. Supervisas el monorepo y despliegues en Google Cloud."
    },
    {
        "id": "agent-mkt-01",
        "displayName": "Activa Marketing",
        "description": "Creativo y Analista de Campañas.",
        "instructions": "Gestionas la identidad de marca Titanium. Creas copys y analizas métricas."
    },
    {
        "id": "agent-ceo-01",
        "displayName": "Activa Dirección",
        "description": "Estrategia y Visión Global.",
        "instructions": "Tienes visión total. Ayudas a tomar decisiones estratégicas basadas en datos financieros."
    }
];

// AUTHENTICATION STRATEGY:
// Application Default Credentials (ADC) works automatically in Cloud Functions.
const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// SERVER SETUP
const server = new Server(
    {
        name: "activa-enterprise-mcp",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
            prompts: {}, // ENABLE PROMPTS CAPABILITY
        },
    }
);

// TOOL DEFINITIONS
const TOOLS = {
    SEARCH_DRIVE: "drive_search",
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: TOOLS.SEARCH_DRIVE,
                description: "Search for files in Activa S.L. Corporate Drive (Google Enterprise).",
                inputSchema: zodToJsonSchema(
                    z.object({
                        query: z.string().describe("The search query (e.g., 'Project Titan proposals')"),
                        limit: z.number().optional().describe("Max number of results (default 5)"),
                    })
                ),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        if (name === TOOLS.SEARCH_DRIVE) {
            const { query, limit = 5 } = args as { query: string; limit?: number };
            // Sanitize input to prevent Drive query injection
            const sanitizedQuery = query.replace(/'/g, "\\'")
                .replace(/\\/g, '')
                .substring(0, 200);

            const res = await drive.files.list({
                q: `name contains '${sanitizedQuery}' and trashed = false`,
                pageSize: limit,
                fields: "files(id, name, mimeType, webViewLink, createdTime)",
            });

            const files = res.data.files || [];

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(files.map(f => ({
                            name: f.name,
                            link: f.webViewLink,
                            type: f.mimeType,
                            created: f.createdTime
                        })), null, 2),
                    },
                ],
            };
        }

        throw new Error(`Tool not found: ${name}`);
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});

// --- PROMPT HANDLERS (AGENT FLEET) ---

server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: AGENT_FLEET.map(agent => ({
            name: agent.id,
            description: agent.description,
            arguments: [] // Arguments could be added for dynamic agent behavior
        }))
    };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const agent = AGENT_FLEET.find(a => a.id === request.params.name);

    if (!agent) {
        throw new Error(`Agent (Prompt) not found: ${request.params.name}`);
    }

    return {
        description: agent.description,
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `SYSTEM INSTRUCTION: ${agent.instructions}\n\nCONTEXT: You are operating within the Activa Enterprise environment. Use available tools to assist the user.`
                }
            }
        ]
    };
});


// EXPRESS APP
const app = express();
app.use(cors({ origin: true })); // Allow all origins for simplicity in demo
app.use(express.json());

const transports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
    // console.log("New SSE connection established");
    const transport = new SSEServerTransport("/mcpServer/messages", res);
    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);

    await server.connect(transport);

    req.on("close", () => {
        transports.delete(sessionId);
    });
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (!transport) {
        res.status(404).send("Session not found");
        return;
    }

    try {
        await transport.handlePostMessage(req, res);
    } catch (error) {
        console.error("Error handling message:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/health", (req, res) => {
    res.status(200).send("Activa Brain Operational");
});

// Zod Helper
function zodToJsonSchema(schema: z.ZodType): any {
    return {
        type: "object",
        properties: {
            query: { type: "string", description: "The search query" },
            limit: { type: "number", description: "Max results" }
        },
        required: ["query"]
    };
}

// EXPORT FUNCTION specifically named 'mcpServer'
export const mcpServer = onRequest({
    region: "europe-west1",
    memory: "1GiB",
    timeoutSeconds: 300,
    cors: true,
}, app);
