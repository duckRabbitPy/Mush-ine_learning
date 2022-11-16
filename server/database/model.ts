import { QueryResult } from "pg";
import { returnLvl } from "../../utils/client_safe";
import { TrainingData } from "../../utils/server_side";

import db from "./connection";

export type MushroomName = string;

export type Game_types = "forage" | "multi" | "tile";

export type Mushine_learning_user = {
  id: number;
  user_id: string;
  xp: number;
};

export type Mushine_training_weightings = {
  id: number;
  correct_mushroom: MushroomName;
  timestamp: string;
  misidentified_as: MushroomName;
  weight: number;
};

export type Mushine_round_metadata = {
  id: number;
  game_type: Game_types;
  current_level: number;
  correct_mushroom: MushroomName;
  correct_answer: boolean;
  timestamp: string;
};

export type Mushine_level_snapshots = {
  id: number;
  level: number;
  user_id: string;
  snapshot: LevelSnapshot;
};

export type LevelSnapshot = {
  user_id: string;
  level: number;
  snapshot: Record<MushroomName, SummedWeights>;
};

export type Heatmap = Pick<
  Mushine_round_metadata,
  "timestamp" | "correct_answer"
>;

export type SummedWeights = Record<MushroomName, number>;

export function createUser(user_id: string) {
  return db
    .query(
      "INSERT INTO mushine_learning_user (user_id, xp) VALUES ($1, 0) RETURNING *",
      [user_id]
    )
    .then((result: QueryResult<Pick<Mushine_learning_user, "user_id">>) => {
      return result.rows[0].user_id;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateScore(Score: number, user_id: string) {
  return db
    .query(
      "UPDATE mushine_learning_user SET xp = $1 WHERE user_id = $2 RETURNING xp;",
      [Score, user_id]
    )
    .then((result: QueryResult<Pick<Mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function getScoreByUserId(user_id: string) {
  return db
    .query("SELECT xp FROM mushine_learning_user WHERE user_id = $1", [user_id])
    .then((result: QueryResult<Pick<Mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateTrainingData(
  trainingData: TrainingData[],
  user_id: string
) {
  for (const lesson of trainingData) {
    if (lesson.weightingData) {
      const weightEntries = Object.entries(lesson.weightingData);

      for (const weightEntry of weightEntries) {
        const misidentified_as = weightEntry[0];
        const correct_mushroom = lesson.misidentifiedMushroom;
        const weight = weightEntry[1];
        await db
          .query(
            `INSERT INTO mushine_training_weightings (user_id, correct_mushroom, misidentified_as, weight, timestamp) VALUES ($1, $2, $3, $4, to_timestamp(${Date.now()} / 1000.0)) RETURNING *`,
            [user_id, correct_mushroom, misidentified_as, weight]
          )
          .then((result: QueryResult<Mushine_training_weightings>) => {
            return result.rows[0];
          })
          .catch((error: Error) => console.log(error));
      }
    }
  }

  return trainingData;
}

export async function updateRoundMetaData(
  user_id: string,
  current_level: number,
  metadataInput: Pick<
    Mushine_round_metadata,
    "correct_answer" | "game_type" | "correct_mushroom"
  >[]
) {
  for (const roundData of metadataInput) {
    const { correct_answer, correct_mushroom, game_type } = roundData;
    await db
      .query(
        `INSERT INTO mushine_round_metadata (user_id, game_type, current_level, correct_mushroom, correct_answer, timestamp) VALUES ($1, $2, $3, $4, $5, to_timestamp(${Date.now()} / 1000.0)) RETURNING *`,
        [user_id, game_type, current_level, correct_mushroom, correct_answer]
      )
      .then((result: QueryResult<Mushine_round_metadata>) => {
        return result.rows[0];
      })
      .catch((error: Error) => console.log(error));
  }
}

export async function getRoundMetadata(user_id: string, current_level: number) {
  return db
    .query(
      "SELECT game_type, correct_mushroom, correct_answer FROM mushine_round_metadata WHERE user_id = $1 AND current_level = $2;",
      [user_id, current_level]
    )
    .then(
      (
        result: QueryResult<
          Pick<
            Mushine_round_metadata,
            "game_type" | "correct_mushroom" | "correct_answer"
          >
        >
      ) => {
        return result.rows;
      }
    )
    .catch((error: Error) => console.log(error));
}

// export async function getHeatmapData(mushroomNames: MushroomName[]) {
//   const argPlaceHolders = (args: string[]) =>
//     args.map((_, index) => `$${index}`);

//   const heatmaps = await db.query(`SELECT `).then((result: Heatmap) => {});
//   return heatmaps;
// }

export async function getCommonConfusions(name: string, user_id: string) {
  const misidentifiedArr = await db
    .query(
      `SELECT weight, misidentified_as FROM mushine_training_weightings WHERE correct_mushroom = $1 AND user_id = $2`,
      [name, user_id]
    )
    .then((result: QueryResult<Mushine_training_weightings>) => {
      return result.rows;
    })
    .catch((error: Error) => console.log(error));

  if (!misidentifiedArr) return [];

  const ranked = Object.entries(aggregateWeightings(misidentifiedArr))
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => ({ misidentified_as: name }));

  return ranked.slice(0, 3);
}

export async function saveLevelSnapshot(
  storedMushrooms: string[],
  user_id: string
) {
  let snapshot: Record<MushroomName, SummedWeights> = {};

  for (const mushroomName of storedMushrooms) {
    const shroomAndWeighting = await db
      .query(
        "SELECT weight, misidentified_as FROM mushine_training_weightings WHERE mushine_training_weightings.correct_mushroom = $1 AND user_id = $2",
        [mushroomName, user_id]
      )
      .then(
        (
          result: QueryResult<
            Pick<Mushine_training_weightings, "weight" | "misidentified_as">
          >
        ) => {
          return aggregateWeightings(result.rows);
        }
      )
      .catch((error: Error) => console.log(error));

    snapshot[mushroomName as keyof typeof snapshot] = shroomAndWeighting ?? {};
  }

  const currLevel = await getCurrentLevel(user_id);

  const savedSnapShot = await db.query(
    `INSERT into mushine_level_snapshots (level, user_id, snapshot) VALUES ($1, $2, $3) RETURNING level, snapshot`,
    [currLevel, user_id, snapshot]
  );

  return savedSnapShot.rows[0];
}

export async function getCurrentLevel(user_id: string) {
  const currXp = await db
    .query(`SELECT xp FROM mushine_learning_user WHERE user_id = $1`, [user_id])
    .then((result: QueryResult<Pick<Mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));

  return returnLvl(currXp);
}

export async function getLevelSnapshot(level: number, user_id: string) {
  return await db
    .query(
      `SELECT snapshot, level FROM mushine_level_snapshots WHERE level = $1 AND user_id = $2`,
      [level, user_id]
    )
    .then((result: QueryResult<Pick<LevelSnapshot, "snapshot" | "level">>) => {
      return result.rows[0];
    })
    .catch((error: Error) => console.log(error));
}

function aggregateWeightings(
  trainingWeightings: Pick<
    Mushine_training_weightings,
    "weight" | "misidentified_as"
  >[]
) {
  const aggregated = trainingWeightings.reduce((acc: SummedWeights, curr) => {
    if (acc[curr.misidentified_as] && acc[curr.misidentified_as]) {
      acc[curr.misidentified_as] += curr.weight;
    } else {
      acc[curr.misidentified_as] = curr.weight;
    }
    return acc;
  }, {});

  return aggregated;
}
