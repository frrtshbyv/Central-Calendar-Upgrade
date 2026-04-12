import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import PgSession from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

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
      ttl: 60 * 60, // 1 hour in seconds
      pruneSessionInterval: 60 * 15, // prune every 15 minutes
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

app.use("/api", router);

export default app;
