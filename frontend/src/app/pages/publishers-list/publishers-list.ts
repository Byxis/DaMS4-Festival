import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Router} from '@angular/router';
import {EntityDTO} from '@publisher/entityDto';
import {PublisherEditDialog} from '@publisher/publisher-edit-dialog/publisher-edit-dialog.component';
import {PublisherService} from '@publisher/publisher.service';
import {computedSorted, SortConfig} from '@shared/utils/sort.utils'

const getContactCount = (p: EntityDTO): number => p.contacts?.length ?? 0;
const getFirstContactName = (p: EntityDTO): string => {
    if (!p.contacts || p.contacts.length === 0) return '';
    return `${p.contacts[0].name} ${p.contacts[0].family_name}`;
};
const getGameCount = (p: EntityDTO): number => 0;
const getFestivalCount = (p: EntityDTO): number => 0;

const SORT_STRATEGIES: SortConfig<EntityDTO> = {
    'ID': (a, b) => (a.id ?? 0) - (b.id ?? 0),
    'ID_REVERSE': (a, b) => (b.id ?? 0) - (a.id ?? 0),

    'NAME': (a, b) => a.name.localeCompare(b.name),
    'NAME_REVERSE': (a, b) => b.name.localeCompare(a.name),

    'GAMES': (a, b) => getGameCount(a) - getGameCount(b),
    'GAMES_REVERSE': (a, b) => getGameCount(b) - getGameCount(a),

    'CONTACTS': (a, b) => getContactCount(a) - getContactCount(b),
    'CONTACTS_REVERSE': (a, b) => getContactCount(b) - getContactCount(a),

    'FIRST_CONTACT': (a, b) => {
        const valA = getFirstContactName(a);
        const valB = getFirstContactName(b);
        if (!valA && !valB) return 0;
        if (!valA) return 1;
        if (!valB) return -1;
        return valA.localeCompare(valB);
    },
    'FIRST_CONTACT_REVERSE': (a, b) => {
        const valA = getFirstContactName(a);
        const valB = getFirstContactName(b);
        if (!valA && !valB) return 0;
        if (!valA) return 1;
        if (!valB) return -1;
        return valB.localeCompare(valA);
    },

    'FESTIVALS': (a, b) => getFestivalCount(a) - getFestivalCount(b),
    'FESTIVALS_REVERSE': (a, b) => getFestivalCount(b) - getFestivalCount(a),
};

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
export class PublishersList
{
    private readonly router = inject(Router);
    private readonly publisherService = inject(PublisherService);
    private readonly dialog = inject(MatDialog);

    readonly sortKey = signal<string>('NAME');
    readonly searchTerm = signal<string>('');

    readonly isLoading = computed(() => this.publisherService.isLoading());
    readonly isError = computed(() => this.publisherService.isError());

    readonly basePublishers = computed(() => {
        let pubs = [...this.publisherService._publishers()];
        const term = this.searchTerm().toLowerCase().trim();
        if (term)
        {
            pubs = pubs.filter((p) => p.name.toLowerCase().includes(term));
        }
        return pubs;
    });

    readonly items = computedSorted(this.basePublishers, this.sortKey, SORT_STRATEGIES);

    // Expose helpers for template
    readonly getContactCount = getContactCount;
    readonly getFirstContactName = getFirstContactName;
    readonly getGameCount = getGameCount;
    readonly getFestivalCount = getFestivalCount;

    viewPublisher(publisher: EntityDTO): void
    {
        if (publisher.id)
        {
            this.router.navigate(['/publishers', publisher.id]);
        }
    }

    sortBy(column: string): void
    {
        const current = this.sortKey();
        if (current === column)
        {
            this.sortKey.set(column + '_REVERSE');
        }
        else
        {
            this.sortKey.set(column);
        }
    }

    trackByPublisherId(index: number, publisher: EntityDTO): number
    {
        return publisher.id ?? index;
    }

    openCreateDialog(): void
    {
        const dialogRef = this.dialog.open(PublisherEditDialog, {
            data: null,
            width: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.publisher)
            {
                this.publisherService.register(result.publisher, result.newLogo);
            }
        });
    }

    editPublisher(event: Event, publisher: EntityDTO): void
    {
        event.stopPropagation();
        const dialogRef = this.dialog.open(PublisherEditDialog, {
            data: publisher,
            width: '600px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.publisher && publisher.id)
            {
                this.publisherService.update(publisher.id, result.publisher, result.newLogo, result.deleteLogo);
            }
        });
    }

    deletePublisher(event: Event, publisher: EntityDTO): void
    {
        event.stopPropagation();
        if (publisher.id && confirm(`Êtes-vous sûr de vouloir supprimer "${publisher.name}" ?`))
        {
            this.publisherService.delete(publisher.id);
        }
    }

    getSortTooltip(column: string, label: string): string
    {
        const current = this.sortKey();
        if (current === column)
        {
            return `Trier par ${label} (Croissant)`;
        }
        if (current === column + '_REVERSE')
        {
            return `Trier par ${label} (Décroissant)`;
        }
        return `Trier par ${label}`;
    }
}
