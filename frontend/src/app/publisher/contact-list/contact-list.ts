import { Component, computed, inject, input, signal } from '@angular/core';
import { ContactDTO } from '../contactDto';
import { output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { AuthService } from '@auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

type SortColumn = 'name' | 'role' | 'telephone' | 'email';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'contact-list',
  standalone: true,
  imports: [MatIcon, MatIconButton, CommonModule, MatTooltipModule, MatButtonModule],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  readonly authSvc = inject(AuthService);

  readonly contacts = input.required<ContactDTO[]>();

  readonly addContact = output<void>();
  readonly editContact = output<ContactDTO>();
  readonly deleteContact = output<ContactDTO>();

  readonly sortColumn = signal<SortColumn>('name');
  readonly sortDirection = signal<SortDirection>('asc');

  readonly sortedContacts = computed(() => {
    let contactList = [...this.contacts()];

    const column = this.sortColumn();
    const direction = this.sortDirection();
    const multiplier = direction === 'asc' ? 1 : -1;

    contactList.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (column) {
        case 'name':
          compareA = `${a.name} ${a.family_name}`.toLowerCase();
          compareB = `${b.name} ${b.family_name}`.toLowerCase();
          break;
        case 'role':
          compareA = (a.role ?? '').toLowerCase();
          compareB = (b.role ?? '').toLowerCase();
          break;
        case 'telephone':
          compareA = a.telephone;
          compareB = b.telephone;
          break;
        case 'email':
          compareA = (a.email ?? '').toLowerCase();
          compareB = (b.email ?? '').toLowerCase();
          break;
      }

      if (compareA < compareB) return -1 * multiplier;
      if (compareA > compareB) return 1 * multiplier;
      return 0;
    });

    return contactList;
  });

  sortBy(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortTooltip(column: string, label: string): string {
    if (this.sortColumn() === column) {
      const direction = this.sortDirection() === 'asc' ? 'Croissant' : 'Décroissant';
      return `Trier par ${label} (${direction})`;
    }
    return `Trier par ${label}`;
  }

  trackByContactId(index: number, contact: ContactDTO): number {
    return contact.id ?? index;
  }

  onAdd(): void {
    this.addContact.emit();
  }

  onEdit(contact: ContactDTO): void {
    this.editContact.emit(contact);
  }

  onDelete(contact: ContactDTO): void {
    this.deleteContact.emit(contact);
  }
}
