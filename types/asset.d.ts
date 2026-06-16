export interface Asset {
  _id: string;
  Brand: string;
  Model: string;
  Type?: string;
  Site?: string;
  Description: string;
  Purchase_Date: number;
  Status: number;
  [key: string]: any; 
}

export type AssetPropertyOptions = {
  Brand: string[];
  Model: string[];
  Type: string[];
  Site: string[];
};
