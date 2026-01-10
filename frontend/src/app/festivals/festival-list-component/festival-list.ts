import { Component, WritableSignal, effect, computed, inject } from '@angular/core';
import { FestivalCard } from '../festival-card-component/festival-card';
import { FestivalService } from '../festival-service/festival-service';
import { MatIcon } from '@angular/material/icon';
import { FestivalNewFormComponent } from "../festival-new-form-component/festival-new-form-component";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-festival-list',
  imports: [FestivalCard, FestivalNewFormComponent, MatButtonModule, MatIcon],
  templateUrl: './festival-list.html',
  styleUrl: './festival-list.scss'
})
  export class FestivalList {

    constructor() {
      effect(() => { this.svc.loadFestivalsFromServer() });
    }
    readonly svc = inject(FestivalService);
  }
