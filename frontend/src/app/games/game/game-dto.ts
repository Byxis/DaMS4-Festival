import { HttpClient } from "@angular/common/http"
import { inject } from "@angular/core"

export interface GameDto {
  id: number | undefined;
  logoUrl?: string;
  logo?: string | File; 
  name: string;
  editor_name?: string;  
  publisher_id?: number;  
  type: string;
  minimum_number_of_player: number;
  maximum_number_of_player: number;
}