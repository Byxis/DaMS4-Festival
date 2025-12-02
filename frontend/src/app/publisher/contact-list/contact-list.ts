import { Component, input, Input } from '@angular/core';
import { ContactDTO } from '../contact-dto';
import { output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'contact-list',
  imports: [MatIcon, MatCard, MatCardTitle, MatIconButton],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  readonly contacts = input.required<ContactDTO[]>();

  readonly addContact = output<void>();
  readonly editContact = output<ContactDTO>();

  onAdd(): void {
    this.addContact.emit();
  }

  onEdit(contact: ContactDTO): void {
    this.editContact.emit(contact);
  }
}
