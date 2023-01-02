export as namespace GlobalTypes;

type CloudImage = {
  asset_id: string | null | undefined;
  public_id: string | null | undefined;
  format: string | null | undefined;
  version: number | null | undefined;
  resource_type: string | null | undefined;
  type: string | null | undefined;
  created_at: string | null | undefined;
  bytes: number | null | undefined;
  width: number | null | undefined;
  height: number | null | undefined;
  folder: string | null | undefined;
  url: string | null | undefined;
};

type CloudinaryResult = {
  resources: CloudImage[];
};

type SubfolderResult = {
  name: string;
  path: string;
};

type Thumbnails = Record<string, string>;

type MushroomName = string;

type Game_types = "forage" | "multi" | "tile";

type Mushine_round_metadata = {
  id: number;
  game_type: Game_types;
  current_level: number;
  correct_mushroom: MushroomName;
  correct_answer: boolean;
  timestamp: string;
};

type TimeAndResult = Pick<
  Mushine_round_metadata,
  "timestamp" | "correct_answer"
>;

type Heatmaps = Record<MushroomName, TimeAndResult[]>;

type SummedWeights = Record<MushroomName, number>;

enum InsightSortOptions {
  "Alphabetical",
  "HighAccuracyFirst",
  "LowAccuracyFirst",
}
