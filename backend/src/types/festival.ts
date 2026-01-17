import type { Tarif_Zone } from "./tarif_zone.js";

export interface Festival {
    id: number;
    name: string;
    location: string;
    start_date: Date;
    end_date: Date;
    table_count: number;
    big_table_count: number;
    town_table_count: number;
    logoUrl? : string;
    tarif_zones: Tarif_Zone[];
}