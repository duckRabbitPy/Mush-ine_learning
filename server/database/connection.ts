import * as pg from "pg";
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) throw new Error("no database URL env var!");

const options = {
  connectionString: DB_URL,
  max: 40,
};

const db = new pg.Pool(options);

export default db;
