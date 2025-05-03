import { Component, OnInit } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { EventsService } from '../services/events.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'event-page',
  standalone: true,
  imports: [NgIf, NgForOf],
  providers: [DatePipe],
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.scss'],
})
export class EventPageComponent implements OnInit {
  event: any;
  loading: boolean = true;

  constructor(
    private eventService: EventsService,
    private route: ActivatedRoute,
    private datePipe: DatePipe
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
    this.eventService.getEventById(eventId).subscribe({
      next: (data) => {
        this.event = this.transformEventData(data);
        this.loading = false;
      },
      error: () => {
        console.log('Event not found');
        this.loading = false;
      },
    });
  }

  transformEventData(event: any) {
    return {
      ...event,
      startDate: this.datePipe.transform(event.startDate, 'dd.MM.yyyy'),
      endDate: this.datePipe.transform(event.endDate, 'dd.MM.yyyy'),
      pets: event.pets?.map((pet: { name: string }) => pet.name) || [],
      breeds: event.breeds?.map((breed: { name: string }) => breed.name) || [],
      photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
    };
  }
}
