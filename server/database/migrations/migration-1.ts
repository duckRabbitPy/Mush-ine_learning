import { randomUUID } from "crypto";
import { storedMushrooms } from "../../../storedMushrooms";
import db from "../connection";

// ts-node migration-1.ts
export async function initTables() {
  await db.query(
    "CREATE TABLE mushine_learning_user (id SERIAL PRIMARY KEY, user_id VARCHAR(50),xp INTEGER)"
  );

  await db.query(
    "CREATE TABLE mushine_training_mushrooms (id SERIAL PRIMARY KEY, name VARCHAR (50), mushroom_id UUID)"
  );

  await db.query(
    "CREATE TABLE mushine_training_weightings (id SERIAL PRIMARY KEY, user_id VARCHAR (50), name VARCHAR (50), mushroom_id UUID, misidentified_as UUID, weight integer, timestamp TIMESTAMP)"
  );

  await db.query(
    "CREATE TABLE mushine_level_snapshots (level SERIAL PRIMARY KEY,user_id VARCHAR (50),snapshot JSONB);"
  );
}

export async function initTrainingMushroomSet() {
  const trainingMushrooms = storedMushrooms;
  for (const mushroomName of trainingMushrooms) {
    const uuid = randomUUID();
    await db
      .query(
        "INSERT INTO mushine_training_mushrooms3 (name, mushroom_id) VALUES ($1, $2) RETURNING *",
        [mushroomName, uuid]
      )
      .catch((error: Error) => console.log(error));
  }
}

initTables();
initTrainingMushroomSet();
