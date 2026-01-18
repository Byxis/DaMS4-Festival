import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent
{
    private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
    data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

    onCancel(): void
    {
        this.dialogRef.close(false);
    }

    onConfirm(): void
    {
        this.dialogRef.close(true);
    }
}
