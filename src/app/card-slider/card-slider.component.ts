import {Component, OnInit} from '@angular/core';
import Swiper from "swiper";
import {Navigation, Pagination} from "swiper/modules";
import {NgForOf} from "@angular/common";

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-card-slider',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './card-slider.component.html',
  styleUrl: './card-slider.component.scss',
})
export class CardSliderComponent implements OnInit{
  images = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
  ];
  ngOnInit(): void {
    new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }
}
