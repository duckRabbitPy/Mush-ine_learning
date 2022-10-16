import type { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import path from "path";

export default function readfiles(req: NextApiRequest, res: NextApiResponse) {
  const mushroomDir = req.query.mushroomDir;
  const dirRelativeToPublicFolder = `mushroom_images/${mushroomDir}`;
  const dir = path.resolve("./public", dirRelativeToPublicFolder);
  const filenames = fs.readdirSync(dir);
  const images = filenames.map((name) =>
    path.join("/", dirRelativeToPublicFolder, name)
  );
  res.statusCode = 200;
  res.json(images);
}
