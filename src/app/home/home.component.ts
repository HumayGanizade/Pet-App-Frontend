import { Component } from '@angular/core';
import {CardSliderComponent} from "../card-slider/card-slider.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CardSliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
