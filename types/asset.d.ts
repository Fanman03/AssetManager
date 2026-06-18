export interface Asset {
  _id: string;
  Brand: string;
  Model: string;
  Type?: string;
  Site?: string;
  Location?: string;
  Description: string;
  Purchase_Date: number;
  Status: number;
  [key: string]: any; 
}

export type AssetPropertyOptions = Record<string, string[]> & {
  Brand: string[];
  Model: string[];
  Type: string[];
  Site: string[];
  Location: string[];
};
