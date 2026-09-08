import { defineConfig } from "prisma/config";

const DEV_URL = "postgresql://postgres.mrdeeltxygstlftuburd:WWuir3FHM0OuZcuw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DEV_URL,
    shadowDatabaseUrl: DEV_URL,
  },
});