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
