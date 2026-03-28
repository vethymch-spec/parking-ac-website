import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerBlogSSRRoutes } from "../blogSSR";
import { registerProductSSRRoutes } from "../productSSR";
import { registerPageSSRRoutes } from "../pageSSR";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Page SSR routes (/, /about, /contact) — P1 soft-404 fix
  registerPageSSRRoutes(app);
  // Blog SSR routes — must be before static/Vite middleware
  registerBlogSSRRoutes(app);
  // Product SSR routes — P0 soft-404 fix
  registerProductSSRRoutes(app);
  // Temporary DB init endpoint (remove after migration)
  app.get('/api/db-init', async (req, res) => {
    const secret = req.query.secret;
    if (secret !== 'railway-init-2024') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const mysql2 = await import('mysql2/promise');
      const conn = await mysql2.createConnection(process.env.DATABASE_URL || '');
      const sqlStatements = (req.query.sql as string || '').split(';').filter(s => s.trim());
      const results: string[] = [];
      for (const stmt of sqlStatements) {
        try {
          await conn.execute(stmt.trim());
          results.push(`OK: ${stmt.trim().substring(0, 60)}...`);
        } catch (e: any) {
          results.push(`ERR: ${e.message} | ${stmt.trim().substring(0, 60)}...`);
        }
      }
      await conn.end();
      res.json({ success: true, results });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/db-init', async (req, res) => {
    const secret = req.query.secret;
    if (secret !== 'railway-init-2024') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const mysql2 = await import('mysql2/promise');
      const conn = await mysql2.createConnection(process.env.DATABASE_URL || '');
      const sql = req.body.sql || '';
      const sqlStatements = sql.split(';').filter((s: string) => s.trim());
      const results: string[] = [];
      for (const stmt of sqlStatements) {
        try {
          await conn.execute(stmt.trim());
          results.push(`OK: ${stmt.trim().substring(0, 80)}...`);
        } catch (e: any) {
          results.push(`ERR: ${e.message} | ${stmt.trim().substring(0, 80)}...`);
        }
      }
      await conn.end();
      res.json({ success: true, results });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
