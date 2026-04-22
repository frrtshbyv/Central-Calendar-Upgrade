import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import pinoHttp from "pino-http";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";
import { verifyAdminToken } from "./lib/admin-token";

const app: Express = express();

// Trust Replit's reverse proxy so secure cookies work over HTTPS in production
app.set("trust proxy", 1);

// Disable ETags globally — prevents browsers caching auth state as 304
app.set("etag", false);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// No-cache middleware for all admin endpoints
app.use("/api/admin", (_req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

const sessionSecret = process.env.SESSION_SECRET ?? "central-calendar-secret-key-change-in-production";

const PgStore = PgSession(session);

// Create session table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS admin_sessions (
    "sid" varchar NOT NULL,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
  );
  CREATE INDEX IF NOT EXISTS "IDX_admin_sessions_expire" ON admin_sessions ("expire");
`).catch((err: Error) => logger.warn({ err }, "Session table creation warning"));

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: "admin_sessions",
      ttl: 60 * 60,
      pruneSessionInterval: 60 * 15,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "none",
    },
  })
);

// Bearer token fallback for admin auth — used when third-party cookies are
// blocked (e.g. when the app is embedded in an iframe like Replit's preview).
// If a valid Bearer token is presented, mark the session as admin-authenticated
// for the duration of this request so existing requireAdmin checks succeed.
app.use((req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const email = verifyAdminToken(auth.slice(7).trim());
    if (email) {
      (req.session as any).adminAuthenticated = true;
      (req.session as any).adminEmail = email;
    }
  }
  next();
});

app.use("/api", router);

// Serve the built SPA in production from a single Node process
if (isProduction) {
  const candidates = [
    path.resolve(process.cwd(), "artifacts/central-calendar/dist/public"),
    path.resolve(process.cwd(), "../central-calendar/dist/public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(import.meta.dirname ?? process.cwd(), "../../central-calendar/dist/public"),
  ];
  const spaDir = candidates.find((p) => fs.existsSync(path.join(p, "index.html")));

  if (spaDir) {
    logger.info({ spaDir }, "Serving SPA from disk");
    app.use(express.static(spaDir, { index: false, maxAge: "1h" }));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api/")) return next();
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      res.sendFile(path.join(spaDir, "index.html"), (err) => {
        if (err) {
          logger.error({ err, path: req.path }, "Failed to send SPA index");
          if (!res.headersSent) res.status(500).send("Failed to load app");
        }
      });
    });
  } else {
    logger.warn({ candidates, cwd: process.cwd() }, "SPA build directory not found; static serving disabled");
  }
}

// Final error handler — log details so production 500s are diagnosable
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(
    { err: { message: err.message, stack: err.stack }, path: req.path, method: req.method },
    "Unhandled request error",
  );
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

export default app;
