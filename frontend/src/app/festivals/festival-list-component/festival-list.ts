import { Component, signal, WritableSignal, effect, computed, inject } from '@angular/core';
import { FestivalCard } from '../festival-card-component/festival-card';
import { Festival } from '../festival';
import { FestivalService } from '../festival-service/festival-service';
@Component({
  selector: 'app-festival-list',
  imports: [FestivalCard],
  templateUrl: './festival-list.html',
  styleUrl: './festival-list.scss'
})
export class FestivalList {
readonly svc = inject(FestivalService);


  add(name : string, location : string, startDate : Date | null, endDate : Date | null): void{
    if (!startDate  || !endDate){
    console.error("Choissisez une date valide.")
    return;
  }else{
  this.svc.addFestival({name, location, startDate, endDate});
  }

  }

  remove(id:number) : void {this.svc.remove(id)}
  
  removeAll():void {this.svc.removeAll()}




activeFestivals = computed(() => {
  return this.svc.festivals().filter(f => f.currentlyGoing).length;
});
constructor(){
    effect(()=>{
      console.log("Nombre de festivals total : ", this.svc.festivals().length)
      console.log("Nombre de festivals actifs :", this.activeFestivals())
    });
  }

}
