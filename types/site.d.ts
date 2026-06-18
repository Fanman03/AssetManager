export interface SiteContact {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface SiteAddress {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface Site {
  _id: string;
  name: string;
  aliases?: string[];
  address?: SiteAddress;
  contacts?: SiteContact[];
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}
