import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactList } from '@publisher/contact-list/contact-list';
import { ContactDialog } from '@publisher/contact-dialog/contact-dialog.component';
import { ContactDTO } from 'src/app/publisher/contact-dto';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { routes } from 'src/app/app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'publisher',
  imports: [ContactList, MatIcon, MatButton],
  templateUrl: './publisher.html',
  styleUrl: './publisher.scss',
})
export class Publisher {
  private dialog = inject(MatDialog);
  readonly router = inject(Router);

  //TODO: fetch all data from backend
  readonly publisher = {
    id: 1,
    name: 'Awesome Games Studio',
    logoUrl:
      'https://e7.pngegg.com/pngimages/779/61/png-clipart-logo-idea-cute-eagle-leaf-logo-thumbnail.png',
  };

  contacts: ContactDTO[] = [
    {
      familyName: 'Pachinko',
      name: 'Robert',
      role: 'Facturation',
      telephone: '+33764585445',
      email: 'facture@gmail.com',
    },
    {
      familyName: 'Delport',
      name: 'Guilhem',
      role: 'Créateur de jeu',
      telephone: '+33764585913',
      email: 'email@gmail.com',
    },
  ];

  readonly _games: string[] = ['Jeu 1', 'Jeu 2', 'Jeu 3'];
  readonly _festivals: string[] = ['Festival 1', 'Festival 2', 'Festival 3'];

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ContactDialog, {
      data: null,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.contacts = [...this.contacts, result];
      }
    });
    //TODO: send to the backend
  }

  openEditDialog(contact: ContactDTO): void {
    const dialogRef = this.dialog.open(ContactDialog, {
      data: contact,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.contacts.findIndex((c) => c.id === contact.id);
        if (index !== -1) {
          this.contacts = [
            ...this.contacts.slice(0, index),
            result,
            ...this.contacts.slice(index + 1),
          ];
        }
        //TODO: send to the backend
      }
    });
  }

  deleteContact(contact: ContactDTO): void {
    if (confirm(`Êtes-vous sûr de supprimer le contact ${contact.name} ?`)) {
      const index = this.contacts.findIndex((c) => c.id === contact.id);
      if (index !== -1) {
        this.contacts = [...this.contacts.slice(0, index), ...this.contacts.slice(index + 1)];
        //TODO: send to the backend
      }
    }
  }

  deletePublisher(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet éditeur ?')) {
      this.router.navigate(['/publishers']);
      //TODO: call backend to delete publisher
    }
  }
}
