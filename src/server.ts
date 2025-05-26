import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import { z } from "zod";
import { ChainActivity, HolderInfo, HolderStatCounts } from "./types";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

// const API_URL = "https://api.activity.stablecoin.xyz/v1";
const API_URL = process.env.API_URL || "http://localhost:3000/v1/api";
const API_KEY = process.env.API_KEY || "apikey";

console.log("API_URL", API_URL);

app.post('/', async (req: Request, res: Response) => {
  try {
    const server = getServer();
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });
    res.on('close', () => {
      console.log('MCP connection closed');
      transport.close();
      server.close();
    })
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
})

function getServer() {
  const server = new McpServer({
    name: "sbc-tracker",
    version: "1.0.0",
  });

  // Register tools (endpoints)
  server.tool(
    "getChainActivity",
    "Get blockchain activity information",
    {
      chain: z.string().describe("Blockchain identifier"),
    },
    async ({ chain }: { chain: string }) => {
      try {
        const response = await fetch(`${API_URL}/activity/chain/${chain}`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
          }
        });
        const activity: ChainActivity = await response.json();

        console.log("activity", activity);
        
        return {
          content: [
            {
              type: "text" as const,
              text: `Chain activity for ${chain}: Block ${activity.lastProcessedBlock} processed at ${activity.timestamp}`
            }
          ]
        } as any;
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: Failed to fetch chain activity"
            }
          ],
          isError: true
        } as any;
      }
    }
  );

  server.tool(
    "getHolderStatsPerChain",
    "Get holder counts per chain",
    {},
    async () => {
      try {
        const response = await fetch(`${API_URL}/holders/stats/counts`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
          }
        });
        const holderStatCounts: HolderStatCounts = await response.json();

        return {
          content: [
            {
              type: "text" as const,
              text: `Holder statistics counts:
Total: ${holderStatCounts.total}
${Object.entries(holderStatCounts.chains).map(([chain, count]) => `${chain}: ${count}`).join(", ")}`
            }
          ]
        } as any;
      } catch (error) {
        console.error("Error fetching holder stat counts:", error);
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: Failed to fetch holder statistics counts"
            }
          ],
          isError: true
        } as any;
      }
    }
  );

  server.tool(
    "getHolderInfo",
    "Get holder information by address",
    {
      address: z.string().describe("Holder's wallet address"),
    },
    async ({ address }: { address: string }) => {
      try {
        const response = await fetch(`${API_URL}/holders/${address}`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
          }
        });
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const holderInfo: HolderInfo = await response.json();

        return {
          content: [
            {
              type: "text" as const,
              text: `Holder ${address} has 
Balance: ${holderInfo.unified.formattedBalance} SBC
AmountDays: ${holderInfo.unified.amountDays}
LastUpdated: ${new Date(Number(holderInfo.unified.lastUpdated) * 1000).toISOString()}`
            }
          ]
        } as any;
      } catch (error) {
        console.error("Error fetching holder info:", error);
        return {
          content: [
            {
              type: "text" as const, 
              text: `Error: Failed to fetch holder information: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        } as any;
      }
    }
  );

  return server;
}

// Start the server
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});