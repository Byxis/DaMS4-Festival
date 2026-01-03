import { ContactDTO } from './contactDto';

export interface PublisherDTO {
  id?: number;
  name: string;
  contacts?: ContactDTO[];
  logoUrl?: string;
}
