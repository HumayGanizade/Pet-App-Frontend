import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {EditEventsComponent} from "../edit-events/edit-events.component";
import {EditRescueEventsComponent} from "../edit-rescue-events/edit-rescue-events.component";
import {EditLostAnimalEventsComponent} from "../edit-lost-animal-events/edit-lost-animal-events.component";

@Component({
  selector: 'app-edit-all-events',
  standalone: true,
  imports: [
    CommonModule,
    EditEventsComponent,
    MatButtonModule,
    EditRescueEventsComponent,
    EditLostAnimalEventsComponent,
  ],
  templateUrl: './edit-all-events.component.html',
  styleUrl: './edit-all-events.component.scss'
})
export class EditAllEventsComponent {
  selected: 'general' | 'rescue' | 'lost' = 'general';

  constructor() {
  }

  select(type: 'general' | 'rescue' | 'lost') {
    this.selected = type;
  }
}
