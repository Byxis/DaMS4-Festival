import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PublisherService } from 'src/app/publisher/publisher.service';
import { PublisherDTO } from 'src/app/publisher/publisherDto';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PublisherEditDialog } from 'src/app/publisher/publisher-edit-dialog/publisher-edit-dialog.component';

type SortColumn = 'id' | 'name' | 'games' | 'contacts' | 'firstContact' | 'festivals';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'publishers-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    ScrollingModule,
    MatButtonModule,
    MatIconButton,
    MatTooltipModule,
  ],
  templateUrl: './publishers-list.html',
  styleUrl: './publishers-list.scss',
})
export class PublishersList {
  private readonly router = inject(Router);
  private readonly publisherService = inject(PublisherService);
  private readonly dialog = inject(MatDialog);

  readonly sortColumn = signal<SortColumn>('id');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly searchTerm = signal<string>('');

  readonly isLoading = computed(() => this.publisherService.isLoading());
  readonly isError = computed(() => this.publisherService.isError());

  readonly publishers = computed(() => {
    let pubs = [...this.publisherService._publishers()];

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      pubs = pubs.filter((p) => p.name.toLowerCase().includes(term));
    }

    const column = this.sortColumn();
    const direction = this.sortDirection();
    const multiplier = direction === 'asc' ? 1 : -1;

    pubs.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (column) {
        case 'id':
          compareA = a.id ?? 0;
          compareB = b.id ?? 0;
          break;
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 'games':
          compareA = this.getGameCount(a);
          compareB = this.getGameCount(b);
          break;
        case 'contacts':
          compareA = this.getContactCount(a);
          compareB = this.getContactCount(b);
          break;
        case 'firstContact':
          const aHasContact = a.contacts && a.contacts.length > 0;
          const bHasContact = b.contacts && b.contacts.length > 0;
          
          if (!aHasContact && !bHasContact) return 0;
          if (!aHasContact) return 1;
          if (!bHasContact) return -1;
          
          compareA = this.getFirstContactName(a).toLowerCase();
          compareB = this.getFirstContactName(b).toLowerCase();
          break;
        case 'festivals':
          compareA = this.getFestivalCount(a);
          compareB = this.getFestivalCount(b);
          break;
      }

      if (compareA < compareB) return -1 * multiplier;
      if (compareA > compareB) return 1 * multiplier;
      return 0;
    });

    return pubs;
  });

  getContactCount(publisher: PublisherDTO): number {
    return publisher.contacts?.length ?? 0;
  }

  getFirstContactName(publisher: PublisherDTO): string {
    if (!publisher.contacts || publisher.contacts.length === 0) {
      return 'Aucun contact';
    }
    const firstContact = publisher.contacts[0];
    return `${firstContact.name} ${firstContact.family_name}`;
  }

  getGameCount(publisher: PublisherDTO): number {
    
    return publisher.games?.length ?? 0;
  }

  getFestivalCount(publisher: PublisherDTO): number {
    // TODO: Implement when festival participation data is available
    return 0;
  }

  viewPublisher(publisher: PublisherDTO): void {
    if (publisher.id) {
      this.router.navigate(['/publishers', publisher.id]);
    }
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  trackByPublisherId(index: number, publisher: PublisherDTO): number {
    return publisher.id ?? index;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PublisherEditDialog, {
      data: null,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.publisher) {
        this.publisherService.register(result.publisher, result.newLogo);
      }
    });
  }

  editPublisher(event: Event, publisher: PublisherDTO): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(PublisherEditDialog, {
      data: publisher,
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.publisher && publisher.id) {
        this.publisherService.update(
          publisher.id,
          result.publisher,
          result.newLogo,
          result.deleteLogo
        );
      }
    });
  }

  deletePublisher(event: Event, publisher: PublisherDTO): void {
    event.stopPropagation();
    if (publisher.id && confirm(`Êtes-vous sûr de vouloir supprimer "${publisher.name}" ?`)) {
      this.publisherService.delete(publisher.id);
    }
  }

  getSortTooltip(column: string, label: string): string {
    if (this.sortColumn() === column) {
      const direction = this.sortDirection() === 'asc' ? 'Croissant' : 'Décroissant';
      return `Trier par ${label} (${direction})`;
    }
    return `Trier par ${label}`;
  }
}
