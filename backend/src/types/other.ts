
import type {Contact} from "./contact.js";

export interface Other {
    id: number;
    name: string;
    contacts?: Contact[];
}
