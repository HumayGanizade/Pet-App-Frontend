import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {forkJoin, Observable, of} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {EventsService} from "../services/events.service";
import {Router} from "@angular/router";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-find-lost-animal-events',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    ReactiveFormsModule,
    NgIf,
    MatIcon,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './find-lost-animal-events.component.html',
  styleUrl: './find-lost-animal-events.component.scss'
})
export class FindLostAnimalEventsComponent implements OnInit{
  filterForm!: FormGroup;
  lostAnimalEvents: any[] = [];
  isFiltersLoaded = false;
  isLoading = false;
  pets$!: Observable<any>;
  breeds$!: Observable<any>;
  countries$!: Observable<any>;
  cities$!: Observable<any>;
  colors$!: Observable<any>;
  savedEventIds: string[] = [];

  constructor(private fb: FormBuilder, private eventsService: EventsService, private router: Router) {
    this.filterForm = this.fb.group({
      name: [''],
      gender: [''],
      minAge: [''],
      maxAge: [''],
      colorId: [''],
      petId: [''],
      breedIds: [[]],
      countryId: [''],
      cityId: [''],
    })
  }

  ngOnInit(): void {
    this.fetchEvents();
    forkJoin({
      pets: this.fetchPets(),
      countries: this.fetchCountries(),
      colors: this.fetchColors(),
    }).subscribe(({pets, countries, colors}) => {
      this.pets$ = of(pets);
      this.countries$ = of(countries);
      this.colors$ = of(colors);
      this.isFiltersLoaded = true;
    })

    this.loadFilters();

    this.cities$ = this.filterForm.get('countryId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(countryId => countryId ? this.fetchCities(countryId) : [])
    );

    this.breeds$ = this.filterForm.get('petId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(petId => petId ? this.fetchBreeds(petId) : [])
    );
  }

  fetchEvents() {
    this.isLoading = true;
    const formValue = this.filterForm.value;
    const params = {
      ...formValue,
      breedIds: Array.isArray(formValue.breedIds) ? formValue.breedIds.join(',') : '',
    };

    forkJoin({
      events: this.eventsService.getFilteredLostAnimalsEvents(params),
      saved: this.eventsService.getSavedEventsByEventTypeId(3)
    }).subscribe({
      next: ({ events, saved }) => {
        this.lostAnimalEvents = Array.isArray(events)
          ? events.map(event => ({
            ...event,
            photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
          }))
          : [];
        this.savedEventIds = Array.isArray(saved) ? saved.map(e => e.id) : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching events', error);
        this.isLoading = false;
      }
    });
  }


  loadFilters() {
    this.pets$ = this.eventsService.getPets();
    this.countries$ = this.eventsService.getCountries();
  }

  fetchPets() {
    return this.eventsService.getPets().pipe(
      map((pets: any) =>
        Array.isArray(pets) ? pets.map(pet => ({ id: pet.id, name: pet.name })).sort((a, b) => a.name.localeCompare(b.name)) : []
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

  fetchColors() {
    return this.eventsService.getColors().pipe(
      map((colors: any) =>
        Array.isArray(colors) ? colors.map(colors => ({ id: colors.id, name: colors.name })).sort((a, b) => a.name.localeCompare(b.name)) : []
      )
    );
  }

  goToEvent(eventId: string) {
    this.router.navigate(['/app-find-lost-animal-events', eventId]);
  }

  isEventSaved(eventId: string): boolean {
    return this.savedEventIds.includes(eventId);
  }

  toggleSave(event: any, clickEvent: MouseEvent) {
    clickEvent.stopPropagation(); // prevent navigation

    const isSaved = this.isEventSaved(event.id);
    const eventId = event.id;

    const action$ = isSaved
      ? this.eventsService.unsaveEvent(eventId, 3)
      : this.eventsService.saveEvent(eventId, 3);

    action$.subscribe({
      next: () => {
        if (isSaved) {
          this.savedEventIds = this.savedEventIds.filter(id => id !== eventId);
        } else {
          this.savedEventIds.push(eventId);
        }
      },
      error: (err) => {
        console.error('Failed to toggle save:', err);
      }
    });
  }
}
