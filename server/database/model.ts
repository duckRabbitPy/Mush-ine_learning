import db from "./connection";
import { QueryResult } from "pg";
import { returnLvl } from "../../utils/pureFunctions";
import { TrainingData } from "../../utils/serverSideUtils";

type Mushine_learning_user = {
  id: number;
  user_id: string;
  xp: number;
};

type Mushine_level_snapshot = {
  id: number;
  level: number;
  user_id: string;
  snapshot: Record<MushroomName, SummedWeights>;
};

type Mushine_training_weightings = {
  id: number;
  correct_mushroom: MushroomName;
  timestamp: string;
  misidentified_as: MushroomName;
  weight: number;
};

type Activity = {
  day: string;
  roundcount: number;
};

type CachedNames = {
  names: { mushroomNames: string[] };
};

type CachedImages = {
  images: { mushroomImages: { resources: CloudImage[] } };
};

export async function createUser(user_id: string) {
  // TODO should also check for exisitng user in db here
  const queryResult = db.query(
    "INSERT INTO mushine_learning_user (user_id, xp) VALUES ($1, 0) RETURNING *",
    [user_id]
  ) as Promise<QueryResult<Pick<Mushine_learning_user, "user_id">>>;

  return queryResult
    .then((result) => result.rows[0].user_id)
    .catch((error: Error) => console.log(error));
}

export async function getCachedMushroomNames() {
  const queryResult = db.query(
    "SELECT names FROM mushine_cloudinary_cache"
  ) as Promise<QueryResult<CachedNames>>;
  return queryResult
    .then((result) => result.rows[0].names.mushroomNames)
    .catch((error: Error) => console.log(error));
}

export async function getCachedMushroomImages() {
  const queryResult = db.query(
    "SELECT images FROM mushine_cloudinary_cache"
  ) as Promise<QueryResult<CachedImages>>;
  return queryResult
    .then((result) => result.rows[0].images.mushroomImages.resources)
    .catch((error: Error) => console.log(error));
}

export async function updateScore(Score: number, user_id: string) {
  const queryResult = db.query(
    "UPDATE mushine_learning_user SET xp = $1 WHERE user_id = $2 RETURNING xp;",
    [Score, user_id]
  ) as Promise<QueryResult<Pick<Mushine_learning_user, "xp">>>;

  return queryResult
    .then((result) => result.rows[0]?.xp)
    .catch((error: Error) => console.log(error));
}

export async function getXPByUserId(user_id: string) {
  const queryResult = db.query(
    "SELECT xp FROM mushine_learning_user WHERE user_id = $1",
    [user_id]
  ) as Promise<QueryResult<Pick<Mushine_learning_user, "xp">>>;

  return queryResult
    .then((result) => result.rows[0]?.xp)
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
        const queryResult = db.query(
          `INSERT INTO mushine_training_weightings (user_id, correct_mushroom, misidentified_as, weight, timestamp) VALUES ($1, $2, $3, $4, to_timestamp(${Date.now()} / 1000.0)) RETURNING *`,
          [user_id, correct_mushroom, misidentified_as, weight]
        ) as Promise<QueryResult<Mushine_training_weightings>>;

        await queryResult.catch((error: Error) => console.log(error));
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
  const roundMetaDataRes = metadataInput.map((roundData) => {
    const { correct_answer, correct_mushroom, game_type } = roundData;
    const queryResult = db.query(
      `INSERT INTO mushine_round_metadata (user_id, game_type, current_level, correct_mushroom, correct_answer, timestamp) VALUES ($1, $2, $3, $4, $5, to_timestamp(${Date.now()} / 1000.0)) RETURNING *`,
      [user_id, game_type, current_level, correct_mushroom, correct_answer]
    ) as Promise<QueryResult<Mushine_round_metadata>>;

    return queryResult
      .then((result) => result.rows[0])
      .catch((error: Error) => console.log(error));
  });

  return Promise.all(roundMetaDataRes);
}

export async function getRoundMetadata(user_id: string, current_level: number) {
  const queryResult = db.query(
    "SELECT game_type, correct_mushroom, correct_answer FROM mushine_round_metadata WHERE user_id = $1 AND current_level = $2;",
    [user_id, current_level]
  ) as Promise<
    QueryResult<
      Pick<
        Mushine_round_metadata,
        "game_type" | "correct_mushroom" | "correct_answer"
      >
    >
  >;

  return queryResult
    .then((result) => result.rows)
    .catch((error: Error) => console.log(error));
}

export async function getHeatmapData(
  mushroomNames: MushroomName[],
  user_id: string
) {
  const heatmaps = {} as Heatmaps;
  for (const mushroomName of mushroomNames) {
    const queryResult = db.query(
      `SELECT correct_answer, timestamp from mushine_round_metadata WHERE correct_mushroom = $1 AND user_id = $2 ORDER BY timestamp asc;`,
      [mushroomName, user_id]
    ) as Promise<QueryResult<TimeAndResult>>;

    const heatmap = await queryResult
      .then((result) => result.rows)
      .catch((error: Error) => console.log(error));

    if (heatmap) {
      heatmaps[mushroomName as keyof typeof heatmaps] = heatmap;
    }
  }
  return heatmaps;
}

export async function getActivity(user_id: string) {
  const queryResult = db.query(
    `SELECT date_trunc('day', mushine_round_metadata.timestamp) "day", count(*)::int roundcount
      FROM mushine_round_metadata
      WHERE user_id = $1
      GROUP by 1
      ORDER BY day`,
    [user_id]
  ) as Promise<QueryResult<Activity>>;

  return queryResult
    .then((result) => result.rows)
    .catch((error: Error) => console.log(error));
}

export async function saveLevelSnapshot(
  storedMushrooms: string[],
  user_id: string
) {
  let snapshot: Record<MushroomName, SummedWeights> = {};

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

  for (const mushroomName of storedMushrooms) {
    const queryResult = db.query(
      "SELECT weight, misidentified_as FROM mushine_training_weightings WHERE mushine_training_weightings.correct_mushroom = $1 AND user_id = $2",
      [mushroomName, user_id]
    ) as Promise<
      QueryResult<
        Pick<Mushine_training_weightings, "weight" | "misidentified_as">
      >
    >;

    const shroomAndWeighting = await queryResult
      .then((result) => aggregateWeightings(result.rows))
      .catch((error: Error) => console.log(error));

    snapshot[mushroomName as keyof typeof snapshot] = shroomAndWeighting ?? {};
  }

  const currLevel = await getCurrentLevel(user_id);

  const queryResult = db.query(
    `INSERT INTO mushine_level_snapshots (level, user_id, snapshot) VALUES ($1, $2, $3)
    ON CONFLICT (level)
    DO UPDATE SET snapshot = EXCLUDED.snapshot
    RETURNING level, snapshot;`,
    [currLevel, user_id, snapshot]
  ) as Promise<QueryResult<Pick<Mushine_level_snapshot, "snapshot" | "level">>>;

  return queryResult
    .then(
      (
        result: QueryResult<Pick<Mushine_level_snapshot, "snapshot" | "level">>
      ) => result.rows[0]
    )
    .catch((error: Error) => console.log(error));
}

export async function getCurrentLevel(user_id: string) {
  const queryResult = db.query(
    `SELECT xp FROM mushine_learning_user WHERE user_id = $1`,
    [user_id]
  ) as Promise<QueryResult<Pick<Mushine_learning_user, "xp">>>;

  const currXp = await queryResult
    .then((result) => result.rows[0]?.xp)
    .catch((error: Error) => console.log(error));

  return returnLvl(currXp);
}

export async function getLevelSnapshot(level: number, user_id: string) {
  const queryResult = db.query(
    `SELECT snapshot, level FROM mushine_level_snapshots WHERE level = $1 AND user_id = $2`,
    [level, user_id]
  ) as Promise<QueryResult<Pick<Mushine_level_snapshot, "snapshot" | "level">>>;

  return queryResult
    .then((result) => result.rows[0])
    .catch((error: Error) => console.log(error));
}

export async function getMostTroublesome(user_id: string) {
  const queryResult = db.query(
    `SELECT misidentified_as FROM mushine_training_weightings WHERE user_id = $1 GROUP BY misidentified_as ORDER BY SUM(weight) desc LIMIT 8;`,
    [user_id]
  ) as Promise<
    QueryResult<Pick<Mushine_training_weightings, "misidentified_as">>
  >;

  return queryResult
    .then((result) => result.rows.map((mushroom) => mushroom.misidentified_as))
    .catch((error: Error) => console.log(error));
}
