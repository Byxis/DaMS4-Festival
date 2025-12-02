import { Injectable, signal } from '@angular/core';
import { FestivalDto } from '../festival-dto';
import { Festival } from '../festival';

@Injectable({
  providedIn: 'root'
})

export class FestivalService {
  private readonly _festivals = signal<Festival[]>([
    new Festival(1, "Sironastra", "Clermont Ferrand", new Date(2025, 9, 31), new Date(2025, 10, 4)),
    new Festival(2, "What The Fest", "Montpellier", new Date(2025, 8, 13), new Date(2025, 8, 27)),
    new Festival(3, "Negative Club", "Montpellier", new Date(2025, 8, 6), new Date(2026, 11, 30))
  ]);

  readonly festivals = this._festivals.asReadonly(); // Contrat public : lecture seule

  private idCounter = this._festivals.length +1
  //On génère le prochain ID : 
  private getNextId(): number {
    this.idCounter = this.idCounter +1;
    return this.idCounter;
  }

  addFestival(festivalData: Omit<FestivalDto, 'id'>): void {
    const nextId = this.getNextId();
    const festival = new Festival(
      nextId,
      festivalData.name,
      festivalData.location,
      festivalData.startDate,
      festivalData.endDate
    );
    this._festivals.update(list => [...list, festival]);
  }

  remove(id:number) : void {this._festivals.update(list => list.filter(f => f.id !==id))}
  removeAll() : void {this._festivals.set([])}
  
  findById(id:number): Festival | undefined {
    return this._festivals().find(s => s.id === id);
  }

}
