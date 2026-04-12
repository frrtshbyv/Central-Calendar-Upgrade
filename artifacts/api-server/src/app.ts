import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

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
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

app.use("/api", router);

export default app;
