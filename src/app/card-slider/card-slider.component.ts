import {Component, OnInit} from '@angular/core';
import Swiper from "swiper";
import {Navigation, Pagination} from "swiper/modules";

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-card-slider',
  standalone: true,
  imports: [
  ],
  templateUrl: './card-slider.component.html',
  styleUrl: './card-slider.component.scss',
})
export class CardSliderComponent implements OnInit{
  ngOnInit(): void {
  }
}
