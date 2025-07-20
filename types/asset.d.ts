export interface Asset {
  _id: string;
  Brand: string;
  Model: string;
  Description: string;
  Purchase_Date: number;
  Status: number;
  [key: string]: any; 
}