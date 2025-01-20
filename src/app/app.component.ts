import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {HeaderComponent} from "./header/header.component";
import {CardSliderComponent} from "./card-slider/card-slider.component";
import Swiper from "swiper"
import {Navigation, Pagination} from "swiper/modules";
import {NgForOf} from "@angular/common";

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent, HeaderComponent, CardSliderComponent, NgForOf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
