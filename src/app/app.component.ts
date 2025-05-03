import {Component} from '@angular/core';
import {HeaderComponent} from "./header/header.component";
import Swiper from "swiper"
import {Navigation, Pagination} from "swiper/modules";
import {ReactiveFormsModule} from "@angular/forms";

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
