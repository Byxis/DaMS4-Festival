import { ContactDTO } from './contactDto';
import { GameDto } from '../games/game/game-dto';

export interface PublisherDTO {
  id?: number;
  name: string;
  contacts?: ContactDTO[];
  games?: GameDto[],
  logoUrl?: string;
  numberOfGames:number;
}
