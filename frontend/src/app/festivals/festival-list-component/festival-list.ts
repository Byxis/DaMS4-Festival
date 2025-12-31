import { Component, signal, WritableSignal, effect, computed, inject } from '@angular/core';
import { FestivalCard } from '../festival-card-component/festival-card';
import { Festival } from '../festival';
import { FestivalService } from '../festival-service/festival-service';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FestivalNewFormComponent } from "../festival-new-form-component/festival-new-form-component";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
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

  showForm = false;

  //Change the state of showForm to show form
  toggleForm() {
    this.showForm = true;
  }
  closeForm() {
    this.showForm = false;
  }

  onFestivalCreated() {
    this.closeForm() // Ferme le formulaire
    this.svc.loadFestivalsFromServer(); // Actualise la liste
  }


  removeFestival(id: number): void { this.svc.removeFestival(id) }

}
