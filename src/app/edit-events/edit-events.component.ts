import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatButton, MatButtonModule} from "@angular/material/button";
import { EventsService } from "../services/events.service";
import { Router } from "@angular/router";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-edit-events',
  standalone: true,
  imports: [
    MatButton,
    NgForOf,
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatOptionModule
  ],
  providers: [DatePipe],
  templateUrl: './edit-events.component.html',
  styleUrl: './edit-events.component.scss'
})
export class EditEventsComponent implements OnInit {
  events: any[] = [];
  generalEventTypes: any[] = [];
  selectedEventType: any;

  constructor(private eventService: EventsService, private router: Router, private datePipe: DatePipe,  private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getGeneralEventTypes();
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEventsByUserId().subscribe( {
      next: (data) => {
        this.events = this.transformEventData(data);
      },
      error: () => console.log('events were not found')
    });
  }

  transformEventData(events: any[]): any[] {
    return events.map(event => ({
      ...event,
      startDate: this.datePipe.transform(event.startDate, 'dd.MM.yyyy'),
      endDate: this.datePipe.transform(event.endDate, 'dd.MM.yyyy'),
      photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null
    }));
  }

  getGeneralEventTypes() {
    this.generalEventTypes =  this.eventService.getGeneralEventTypes();
  }

  deleteEvent(id: string) {
    this.eventService.deleteEventById(id).subscribe({
      next: () => {
        this.events = this.events.filter((event) => event.id !== id);
        console.log('Event deleted successfully!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting event:', error);
      },
    });
  }

  trackByEventId(event: any): string {
    return event.id;
  }
}
