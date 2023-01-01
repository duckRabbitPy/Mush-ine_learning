export type CloudImage = {
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

export type CloudinaryResult = {
  resources: CloudImage[];
};

export type SubfolderResult = {
  name: string;
  path: string;
};

export type Thumbnails = Record<string, string>;

export type MushroomName = string;

export type Game_types = "forage" | "multi" | "tile";

export type Mushine_round_metadata = {
  id: number;
  game_type: Game_types;
  current_level: number;
  correct_mushroom: MushroomName;
  correct_answer: boolean;
  timestamp: string;
};

export type TimeAndResult = Pick<
  Mushine_round_metadata,
  "timestamp" | "correct_answer"
>;

export type Heatmaps = Record<MushroomName, TimeAndResult[]>;

export type SummedWeights = Record<MushroomName, number>;

export enum InsightSortOptions {
  "Alphabetical",
  "HighAccuracyFirst",
  "LowAccuracyFirst",
}
