import { Component, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFileLines, faMagnifyingGlass, faStar } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { CardTone } from '../panel-cards/panel-cards.component';

/** A saved view in the notebooks rail — All Notes, Starred, Trash and so on. */
export interface NotesRailItem {
  readonly icon: IconDefinition;
  readonly label: string;
  readonly count: string;
  readonly active?: boolean;
}

/** A user notebook, distinguished by a colour chip and its own count. */
export interface NotesBook {
  readonly tone: CardTone;
  readonly label: string;
  readonly count: string;
}

export interface NoteRow {
  readonly title: string;
  readonly modified: string;
  readonly owner: string;
  readonly tone: CardTone;
  readonly starred?: boolean;
  /** The row whose contents fill the detail pane. */
  readonly active?: boolean;
}

export interface NoteAttachment {
  /** Short file-type tag shown on the mark, e.g. PDF or PPT. */
  readonly kind: string;
  readonly tone: CardTone;
  readonly name: string;
  readonly size: string;
}

export interface NoteDetail {
  readonly title: string;
  readonly modified: string;
  readonly owner: string;
  readonly overview: string;
  readonly keyPointsTitle: string;
  readonly keyPoints: readonly string[];
  readonly attachmentsTitle: string;
  readonly attachments: readonly NoteAttachment[];
}

export interface NotesView {
  readonly railTitle: string;
  readonly rail: readonly NotesRailItem[];
  readonly booksTitle: string;
  readonly books: readonly NotesBook[];
  readonly listTitle: string;
  readonly searchPlaceholder: string;
  readonly createLabel: string;
  readonly columns: readonly string[];
  readonly rows: readonly NoteRow[];
  readonly footer: string;
  readonly pages: number;
  readonly detail: NoteDetail;
}

/**
 * The Notes tab's three-pane preview: notebooks rail, note list and the detail
 * pane for the selected note.
 *
 * Its own component rather than more of EcosystemTabsComponent — that
 * stylesheet is already 5.6 kB over the project's per-component warning and
 * within 0.4 kB of the error budget, so this UI could not have lived there.
 *
 * Everything here is a static preview of the product, not a working control:
 * the whole block is inert and hidden from assistive tech by the caller.
 */
@Component({
  selector: 'app-notes-panel',
  imports: [FaIconComponent],
  templateUrl: './notes-panel.component.html',
  styleUrl: './notes-panel.component.css',
})
export class NotesPanelComponent {
  readonly view = input.required<NotesView>();

  protected readonly search = faMagnifyingGlass;
  protected readonly file = faFileLines;
  protected readonly star = faStar;

  protected pageList(count: number): readonly number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
}
