
import { Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import {JsonPipe} from '@angular/common'
import { GameService } from '../game-service/game-service';
import { GameDto } from './game-dto';


export class Game {



   
        constructor(
        public readonly id: number ,
        public name: string,
        public editor: string,
        public type: string,
        public minimum_number_of_player: number,
        public maximum_number_of_player: number,
        
        ) {}

      
       

        static fromDto(dto : GameDto) : Game| null{
            if (dto.id === undefined){return null}

            return new Game(dto.id, dto.name, dto.editor, dto.type, dto.minimum_number_of_player, dto.maximum_number_of_player)
        }
        

}



  


     



