
import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
    selector: 'other-new-dialog',
    standalone: true,
    imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
    templateUrl: './other-new-dialog.html',
})
export class OtherNewDialog
{
    private dialogRef = inject(MatDialogRef<OtherNewDialog>);
    name = '';

    save()
    {
        if (this.name.trim())
        {
            this.dialogRef.close(this.name.trim());
        }
    }

    cancel()
    {
        this.dialogRef.close();
    }
}
