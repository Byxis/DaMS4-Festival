import {ZoneGameDTO } from "./zone-game-dto";

export interface ZoneTarifDTO{
    id?: number
    name : string;
    price : number;
    electricalOutlet: number;
    electricalOutletPrice: number;
    game_zones? : ZoneGameDTO[];
}