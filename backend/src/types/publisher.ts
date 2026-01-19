import type {Contact} from "./contact.js";

export interface Publisher {
    id: number;
    name: string;
    logo?: string;
    contacts?: Contact[];
    logoUrl?: string;
}
