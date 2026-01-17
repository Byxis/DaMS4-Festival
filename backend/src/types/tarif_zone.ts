import type { Game_Zone } from "./game_zone.js";


export interface Tarif_Zone {
    id: number;
    festival_id: number;
    name: string;
    game_zones?: Game_Zone[];
    price: number;
    numberOutlets: number;
    maxTable: number;
}
