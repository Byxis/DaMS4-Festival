import { HttpClient } from "@angular/common/http"
import { inject } from "@angular/core"

export interface GameDto {
  id: number | undefined;
  logoUrl?: string;
  logo?: string;  // ✅ Aussi accepter 'logo' du backend
  name: string;
  editor_name?: string;  // ✅ Optionnel (peut être undefined)
  publisher_id?: number;  // ✅ Ajoute publisher_id
  type: string;
  minimum_number_of_player: number;
  maximum_number_of_player: number;
}