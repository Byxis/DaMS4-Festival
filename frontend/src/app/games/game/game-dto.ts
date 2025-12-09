import { HttpClient } from "@angular/common/http"
import { inject } from "@angular/core"

export interface GameDto {
        
    id: number | undefined
    name: string
    editor_name: string,
    type: string
    minimum_number_of_player: number
    maximum_number_of_player: number
    
    
}

