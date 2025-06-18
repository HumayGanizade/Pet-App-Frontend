import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {forkJoin, Observable, of} from "rxjs";
import {EventsService} from "../services/events.service";
import {Router} from "@angular/router";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-saved-lost-animal-event',
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
  templateUrl: './saved-lost-animal-event.component.html',
  styleUrl: './saved-lost-animal-event.component.scss'
})
export class SavedLostAnimalEventComponent implements OnInit {
  filterForm!: FormGroup;
  lostAnimalEvents: any[] = [];
  isFiltersLoaded = false;
  isLoading = false;
  pets$!: Observable<any>;
  breeds$!: Observable<any>;
  countries$!: Observable<any>;
  cities$!: Observable<any>;
  colors$!: Observable<any>;

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
    this.fetchSavedEvents();
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

  fetchSavedEvents() {
    this.isLoading = true;
    const filters = this.filterForm.value;

    const params = {
      ...filters,
      breedIds: Array.isArray(filters.breedIds) ? filters.breedIds.join(',') : '',
    };

    forkJoin({
      allSaved: this.eventsService.getSavedEventsByEventTypeId(3),
      filtered: this.eventsService.getFilteredLostAnimalsEvents(params)
    }).subscribe({
      next: ({ allSaved, filtered }) => {
        const savedIds = new Set(allSaved.map((e: any) => e.id));

        this.lostAnimalEvents = Array.isArray(filtered)
          ? filtered
            .filter((event: any) => savedIds.has(event.id))
            .map(event => ({
              ...event,
              photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
            }))
          : [];

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching filtered saved events', error);
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

  async goToEvent(eventId: string) {
    try {
      await this.router.navigate(['/app-find-lost-animal-events', eventId]);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  async unsaveEvent(eventId: string, clickEvent: MouseEvent) {
    clickEvent.stopPropagation();
    try {
      await this.eventsService.unsaveEvent(eventId, 3).toPromise();
      this.lostAnimalEvents = this.lostAnimalEvents.filter(event => event.id !== eventId);
    } catch (err) {
      console.error('Failed to unsave event:', err);
    }
  }
}
