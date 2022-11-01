import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { randomUUID } from "crypto";
import { getCloudMushrooms } from "../../../utils/server";
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
    "CREATE TABLE mushine_training_weightings (id SERIAL PRIMARY KEY, user_id VARCHAR (50), correct_mushroom VARCHAR (50), misidentified_as VARCHAR (50), weight integer, timestamp TIMESTAMP)"
  );
  await db.query(
    "CREATE TABLE mushine_level_snapshots (level SERIAL PRIMARY KEY, user_id VARCHAR (50),snapshot JSONB);"
  );

  await db.query(
    "CREATE TABLE mushine_round_metadata (id SERIAL PRIMARY KEY, user_id VARCHAR (50), game_type VARCHAR (50), current_level INTEGER, correct_mushroom VARCHAR (50), correct_answer BOOLEAN, timestamp TIMESTAMP);"
  );
}

export async function initTrainingMushroomSet() {
  const trainingMushrooms = await getCloudMushrooms();
  for (const mushroomName of trainingMushrooms) {
    const uuid = randomUUID();
    await db
      .query(
        "INSERT INTO mushine_training_mushrooms (name, mushroom_id) VALUES ($1, $2) RETURNING *",
        [mushroomName, uuid]
      )
      .catch((error: Error) => console.log(error));
  }
}

initTables().then(() => {
  initTrainingMushroomSet();
});
