import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { v2 as cloudinary } from "cloudinary";
import db from "../server/database/connection";

export type SubfolderResult = {
  name: string;
  path: string;
};

export async function getMushroomNamesFromCloud() {
  const images = (await cloudinary.api.sub_folders("mushroom_images")) as
    | {
        folders: SubfolderResult[];
      }
    | undefined;
  return images ? images.folders.map((i) => i.name) : [];
}

export async function getAllMushroomSrcsFromCloud() {
  const images = await cloudinary.search
    .expression("mushroom_images/*")
    .max_results(1000)
    .execute();
  return images;
}

export async function cacheCloudinaryMushrooms() {
  const mushroomImages = await getAllMushroomSrcsFromCloud();
  const mushroomNames = await getMushroomNamesFromCloud();
  const jsonNames = JSON.stringify({ mushroomNames });
  const jsonImages = JSON.stringify({ mushroomImages });

  await db.query(
    "DROP TABLE IF EXISTS mushine_cloudinary_cache; CREATE TABLE mushine_cloudinary_cache (id SERIAL PRIMARY KEY, names JSONB, images JSONB);"
  );

  await db.query(
    "INSERT INTO mushine_cloudinary_cache (names, images) VALUES ($1, $2)",
    [jsonNames, jsonImages]
  );
}
``;
try {
  cacheCloudinaryMushrooms();
} catch (e) {
  console.log(e);
}
