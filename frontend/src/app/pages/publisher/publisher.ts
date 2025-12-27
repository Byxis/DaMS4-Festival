import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactList } from '@publisher/contact-list/contact-list';
import { ContactDialog } from '@publisher/contact-dialog/contact-dialog.component';
import { ContactDTO } from '@publisher/contactDto';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { PublisherService } from '@publisher/publisher.service';
import { PublisherEditDialog } from '@publisher/publisher-edit-dialog/publisher-edit-dialog.component';
import { PublisherDTO } from '@publisher/publisherDto';

@Component({
  selector: 'publisher',
  imports: [ContactList, MatIcon, MatButton],
  templateUrl: './publisher.html',
  styleUrl: './publisher.scss',
})
export class Publisher {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly publisherService = inject(PublisherService);

  readonly publisherId = input.required<number>({ alias: 'publisher' });

  readonly publisher = computed(() => {
    const id = this.publisherId();
    return this.publisherService._publishers().find((p) => p.id === id)!;
  });

  readonly isLoading = computed(() => this.publisherService.isLoading());

  readonly contacts = computed(() => this.publisher().contacts ?? []);

  openContactAddDialog(): void {
    const dialogRef = this.dialog.open(ContactDialog, {
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.publisherService.addContact(this.publisher()!.id!, result);
      }
    });
  }

  openContactEditDialog(contact: ContactDTO): void {
    const dialogRef = this.dialog.open(ContactDialog, {
      data: contact,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.publisherService.updateContact(this.publisher()!.id!, result);
      }
    });
  }

  deleteContact(contact: ContactDTO): void {
    if (
      confirm(
        `Êtes-vous sûr de supprimer le contact ${contact.name} ? Cette action est irréversible.`
      )
    ) {
      const index = this.contacts().findIndex((c) => c.id === contact.id);
      if (index !== -1) {
        this.publisherService.removeContact(this.publisher()!.id!, contact.id!);
      }
    }
  }

  deletePublisher(): void {
    if (
      confirm('Êtes-vous sûr de vouloir supprimer cet éditeur ? Cette action est irréversible.')
    ) {
      this.publisherService.delete(this.publisher().id!).add(() => {
        this.router.navigate(['/publishers']);
      });
    }
  }

  editPublisher(): void {
    const dialogRef = this.dialog.open(PublisherEditDialog, {
      data: this.publisher(),
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.publisher.name !== this.publisher()!.name) {
          this.publisherService.update(this.publisher()!.id!, { name: result.publisher.name });
        }

        if (result.deleteLogo && this.publisher()!.logoUrl) {
          this.publisherService.deleteLogo(this.publisher()!.id!);
        } else if (result.newLogo) {
          const formData = new FormData();
          formData.append('logo', result.newLogo);
          this.publisherService.uploadLogo(this.publisher()!.id!, formData);
        }
      }
    });
  }
}
