import {Component, OnInit} from '@angular/core';
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
import {EventsService} from "../services/events.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-edit-lost-animal-events',
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
  templateUrl: './edit-lost-animal-events.component.html',
  styleUrl: './edit-lost-animal-events.component.scss'
})
export class EditLostAnimalEventsComponent implements OnInit{
  events: any[] = [];

  constructor(private eventService: EventsService, private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getLostAnimalEventsByUserId().subscribe( {
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
    this.eventService.deleteLostAnimalEventById(id).subscribe({
      next: () => {
        this.events = this.events.filter((event) => event.id !== id);
        console.log('Events after delete:', this.events);
      },
      error: (error) => {
        console.error('Error deleting event:', error);
      },
    });
  }

  trackLostAnimalEventId(index: number, event: any): string {
    return event.id;
  }

  editLostAnimalEvent(id: string): void {
    this.router.navigate(['/app-edit-lost-animal-event-page', id]);
  }
}
