import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const pg = require("pg");

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) throw new Error("no database URL env var!");

const options = {
  connectionString: DB_URL,
  max: 40,
};

const db = new pg.Pool(options);

export default db;
