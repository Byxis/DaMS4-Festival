import { DatePipe } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { FestivalService } from 'src/app/festivals/festival-service/festival-service';


@Component({
  selector: 'app-festival',
  imports: [DatePipe],
  templateUrl: './festival.html',
  styleUrl: './festival.scss'
})
export class Festival {

  id = input.required<number>();

  private readonly svc = inject(FestivalService);

  private readonly router = inject(Router)

  festival = this.svc._currentFestival;


  constructor(){
    effect(() => {
      this.svc.loadFestivalById(this.id());
    });
  }

  goBack(): void {
    this.router.navigate(['/festivals']);
  }


}
