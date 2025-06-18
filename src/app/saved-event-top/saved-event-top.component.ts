import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {SavedGeneralEventComponent} from "../saved-general-event/saved-general-event.component";
import {SavedRescueEventComponent} from "../saved-rescue-event/saved-rescue-event.component";
import {SavedLostAnimalEventComponent} from "../saved-lost-animal-event/saved-lost-animal-event.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-saved-event-top',
  standalone: true,
  imports: [MatButtonModule, SavedGeneralEventComponent, SavedRescueEventComponent, SavedLostAnimalEventComponent, NgIf,],
  templateUrl: './saved-event-top.component.html',
  styleUrl: './saved-event-top.component.scss'
})
export class SavedEventTopComponent {
  selected: 'general' | 'rescue' | 'lost' = 'general';

  select(type: 'general' | 'rescue' | 'lost') {
    this.selected = type;
  }
}
