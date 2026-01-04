import { ContactDTO } from './contactDto';

export interface EntityDTO {
  id?: number;
  name: string;
  contacts?: ContactDTO[];
  logoUrl?: string;
}
