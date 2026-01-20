import { Component, input, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ZoneGameDTO } from '../dtos/zone-game-dto';
import { ZoneTarifDTO } from '../dtos/zone-tarif-dto';
import { GameZoneEditDialog } from '../game-zone-edit-dialog/game-zone-edit-dialog';
import { FestivalService } from '../festival-service/festival-service';

@Component({
  selector: 'app-game-zones-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './game-zones-list.html',
  styleUrl: './game-zones-list.scss',
})
export class GameZonesList {
  private readonly dialog = inject(MatDialog);
  private readonly festivalService = inject(FestivalService);

  festivalId = input.required<number>();
  tarifZone = input.required<ZoneTarifDTO>();
  
  gameZoneChanged = output<void>();

  addGameZone(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(GameZoneEditDialog, {
      data: { 
        festivalId: this.festivalId(), 
        tarifZoneId: this.tarifZone().id, 
        gameZone: null 
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.tarifZone().id) {
        this.festivalService.addGameZone(this.festivalId(), this.tarifZone().id!, result);
        this.gameZoneChanged.emit();
      }
    });
  }

  editGameZone(event: Event, gameZone: ZoneGameDTO): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(GameZoneEditDialog, {
      data: { 
        festivalId: this.festivalId(), 
        tarifZoneId: this.tarifZone().id, 
        gameZone 
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.tarifZone().id && gameZone.id) {
        this.festivalService.updateGameZone(
          this.festivalId(), 
          this.tarifZone().id!, 
          gameZone.id, 
          result
        );
        this.gameZoneChanged.emit();
      }
    });
  }

  deleteGameZone(event: Event, gameZone: ZoneGameDTO): void {
    event.stopPropagation();
    const tarifZoneId = this.tarifZone().id;
    
    if (tarifZoneId && gameZone.id && 
        confirm(`Êtes-vous sûr de vouloir supprimer la zone de jeu "${gameZone.name}" ?`)) {
      this.festivalService.removeGameZone(this.festivalId(), tarifZoneId, gameZone.id);
      this.gameZoneChanged.emit();
    }
  }

  trackByGameZoneId(index: number, gameZone: ZoneGameDTO): number {
    return gameZone.id ?? index;
  }
}