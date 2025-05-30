import {Component, OnInit} from '@angular/core';
import {EventsService} from "../services/events.service";
import {Router} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatOptionModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";

@Component({
  selector: 'app-edit-rescue-events',
  standalone: true,
  imports: [
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
    MatOptionModule,
    MatDialogModule
  ],
  templateUrl: './edit-rescue-events.component.html',
  styleUrl: './edit-rescue-events.component.scss'
})
export class EditRescueEventsComponent implements OnInit{
  events: any[] = [];

  constructor(private eventService: EventsService, private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getRescueEventsByUserId().subscribe( {
      next: (data) => {
        this.events = this.transformEventData(data);
      },
      error: () => console.log('events were not found')
    });
  }

  transformEventData(events: any): any[] {
    return events.map((event: { photo: any; }) => ({
      ...event,
      photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null
    }));
  }

  deleteEvent(id: string) {
    this.eventService.deleteRescueEventById(id).subscribe({
      next: () => {
        this.events = this.events.filter((event) => event.id !== id);
        console.log('Events after delete:', this.events);
      },
      error: (error) => {
        console.error('Error deleting event:', error);
      },
    });
  }

  trackRescueEventId(index: number, event: any): string {
    return event.id;
  }

  editRescueEvent(id: string): void {
    this.router.navigate(['/app-edit-rescue-event-page', id]);
  }
}
