import {Component, OnInit} from '@angular/core';
import {EventsService} from "../services/events.service";
import {ActivatedRoute} from "@angular/router";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-rescue-event-page',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './rescue-event-page.component.html',
  styleUrl: './rescue-event-page.component.scss'
})
export class RescueEventPageComponent implements OnInit{
  event: any;
  loading: boolean = true;

  constructor(
    private eventService: EventsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const eventId = params.get('id');
      if (eventId) {
        this.getEventById(eventId);
      }
    });
  }

  getEventById(eventId: string) {
    this.eventService.getRescueEventById(eventId).subscribe({
      next: (data) => {
        console.log('Fetched event:', data);
        this.event = this.transformEventData(data);
        this.loading = false;
      },
      error: () => {
        console.log('rescueEvent not found');
        this.loading = false;
      },
    });
  }

  transformEventData(event: any) {
    return {
      ...event,
      photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
      pet: event.pet.name,
      breed: event.breed.name,
      color: event.color.name,
    };
  }
}
