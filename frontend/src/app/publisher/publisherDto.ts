export interface PublisherDTO {
  id?: number;
  name: string;
  contacts?: ContactDTO[];
  logoUrl?: string;
}

export interface ContactDTO {
  id?: number;
  family_name: string;
  name: string;
  role?: string;
  telephone?: string;
  email?: string;
}
