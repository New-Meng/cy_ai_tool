import { Schema } from "electron-store";

export interface StoreOptionsInterface {
  defaults?: Record<string, unknown>;
  schema?: Schema<Record<string, unknown>>;
}
