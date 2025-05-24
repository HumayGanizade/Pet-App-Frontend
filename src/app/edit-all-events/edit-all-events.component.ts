import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {EditEventsComponent} from "../edit-events/edit-events.component";

@Component({
  selector: 'app-edit-all-events',
  standalone: true,
  imports: [
    CommonModule,
    EditEventsComponent,
    MatButtonModule,
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
