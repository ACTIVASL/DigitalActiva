#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { google } from "googleapis";
import express from "express";
import cors from "cors";

// AUTHENTICATION STRATEGY:
// For Cloud Run, we use Application Default Credentials (ADC).
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

            const res = await drive.files.list({
                q: `name contains '${query}' and trashed = false`,
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

// EXPRESS APP SETUP FOR HTTP/SSE
const app = express();
app.use(cors());
app.use(express.json());

// Helper to manage transports
// In a real production app, use a proper session store (Redis)
const transports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
    console.log("New SSE connection established");

    const transport = new SSEServerTransport("/messages", res);
    const sessionId = transport.sessionId;
    transports.set(sessionId, transport);

    await server.connect(transport);

    req.on("close", () => {
        console.log(`SSE connection closed: ${sessionId}`);
        transports.delete(sessionId);
        // Clean up connection logic if SDK supports disconnect per transport
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

// Health check
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.error(`Activa Enterprise MCP Server running on port ${PORT}`);
    });
}

export const mcpServer = app;

// HELPER: Zod to JSON Schema
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
