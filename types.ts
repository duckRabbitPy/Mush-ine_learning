export type StringIfPresent = string | null | undefined;
export type NumIfPresent = number | null | undefined;

export type CloudImage = {
  asset_id: StringIfPresent;
  public_id: StringIfPresent;
  format: StringIfPresent;
  version: NumIfPresent;
  resource_type: StringIfPresent;
  type: StringIfPresent;
  created_at: StringIfPresent;
  bytes: NumIfPresent;
  width: NumIfPresent;
  height: NumIfPresent;
  folder: StringIfPresent;
  url: StringIfPresent;
};

export type SubfolderResult = {
  name: string;
  path: string;
};
