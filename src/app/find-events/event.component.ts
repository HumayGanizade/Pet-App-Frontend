import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { EventsService } from "../services/events.service";
import {Observable, forkJoin, of} from "rxjs";
import { map, switchMap, distinctUntilChanged, startWith } from "rxjs/operators";
import { AsyncPipe, DatePipe, NgForOf, NgIf } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {Router} from "@angular/router";

@Component({
  selector: 'app-find-events',
  standalone: true,
  templateUrl: './event.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    DatePipe,
    AsyncPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
  filterForm: FormGroup;
  events: any[] = [];
  isLoading = false;
  isFiltersLoaded = false;
  pets$!: Observable<{ id: string, name: string }[]>;
  breeds$!: Observable<{ id: string, name: string }[]>;
  countries$!: Observable<{ id: string, name: string }[]>;
  cities$!: Observable<{ id: string, name: string }[]>;
  types$!: Observable<{ name: string }[]>;

  constructor(private eventsService: EventsService, private fb: FormBuilder, private router: Router) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      type: [''],
      minPrice: [''],
      maxPrice: [''],
      countryId: [''],
      cityId: [''],
      petIds: [''],
      breedIds: [''],
      name: [''],
    });
  }

  ngOnInit() {
    this.isFiltersLoaded = false;
    this.fetchEvents();
    forkJoin({
      pets: this.fetchPets(),
      countries: this.fetchCountries(),
      types: this.fetchTypes()
    }).subscribe(({ pets, countries, types }) => {
      this.pets$ = of(pets);
      this.countries$ = of(countries);
      this.types$ = of(types);
      this.isFiltersLoaded = true;
    });


    this.cities$ = this.filterForm.get('countryId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(countryId => countryId ? this.fetchCities(countryId) : [])
    );

    this.breeds$ = this.filterForm.get('petIds')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(petId => petId ? this.fetchBreeds(petId) : [])
    );
  }

  fetchEvents() {
    this.isLoading = true;

    this.eventsService.getFilteredEvents(this.filterForm.value).subscribe({
      next: (data) => {
        this.events = Array.isArray(data)
          ? data.map(event => ({
            ...event,
            photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
          }))
          : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching events', error);
        this.isLoading = false;
      }
    });
  }


  fetchPets() {
    return this.eventsService.getPets().pipe(
      map((pets: any) =>
        Array.isArray(pets) ? pets.map(pet => ({ id: pet.id, name: pet.name })).sort((a, b) => a.name.localeCompare(b.name)) : []
      )
    );
  }

  fetchCountries() {
    return this.eventsService.getCountries().pipe(
      map((countries: any) =>
        Array.isArray(countries) ? countries.map(country => ({ id: country.id, name: country.name })).sort((a, b) => a.name.localeCompare(b.name)) : []
      )
    );
  }

  fetchCities(countryId: string) {
    return this.eventsService.getAllCitiesByCountryId(countryId).pipe(
      map((cities: any) =>
        Array.isArray(cities) ? cities.map(city => ({ id: city.id, name: city.name })).sort((a, b) => a.name.localeCompare(b.name)) : []
      )
    );
  }

  fetchBreeds(petId: string) {
    return this.eventsService.getAllBreedsByPetId(petId).pipe(
      map((breeds: any) =>
        Array.isArray(breeds) ? breeds.map(breed => ({ id: breed.id, name: breed.name })).sort((a, b) => a.name.localeCompare(b.name)) : []
      )
    );
  }

  fetchTypes() {
    return this.eventsService.getEventTypes().pipe(
      map((types: any) =>
        Array.isArray(types) ? types.map(type => ({ id: type.id, name: type.name })) : []
      )
    );
  }

  goToEvent(eventId: string) {
    this.router.navigate(['/app-find-events', eventId]);
  }
}
