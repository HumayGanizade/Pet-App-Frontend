import { Component } from '@angular/core';
import {CreateEventComponent} from "../create-event/create-event.component";
import {CreateRescueEventComponent} from "../create-rescue-event/create-rescue-event.component";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-create-all-events',
  standalone: true,
  imports: [
    CommonModule,
    CreateEventComponent,
    CreateRescueEventComponent,
    // CreateLostAnimalEventComponent,
    MatButtonModule
  ],
  templateUrl: './create-all-events.component.html',
  styleUrl: './create-all-events.component.scss'
})
export class CreateAllEventsComponent {
  selected: 'general' | 'rescue' | 'lost' = 'general';

  select(type: 'general' | 'rescue' | 'lost') {
    this.selected = type;
  }
}
