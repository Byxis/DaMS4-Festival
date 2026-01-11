import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PublisherService } from '../publisher.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'publishers-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './publisher-import-dialog.html',
  styleUrl: './publisher-import-dialog.scss',
})
export class PublishersImportDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<PublishersImportDialog>);
  private publisherService = inject(PublisherService);

  editors: any[] = [];
  filteredEditors: any[] = [];
  searchTerm = '';
  isLoading = true;
  displayedColumns = ['name', 'games', 'contacts', 'actions'];

  ngOnInit(): void {
    this.loadEditors();
  }

  

  loadEditors(): void {
    this.isLoading = true;
    this.publisherService.getExistingEditors().subscribe({
      next: (data) => {
        this.editors = data;
        this.filteredEditors = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
      }
    });
  }

  filterEditors(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredEditors = this.editors.filter((e) =>
      e.name.toLowerCase().includes(term)
    );
  }

  importEditor(editor: any): void {
    this.publisherService.importEditor(editor.id).subscribe({
      next: () => {
        this.dialogRef.close(editor);
      },
      error: (err) => console.error('Erreur import:', err)
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}