import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {forkJoin, Observable, of} from "rxjs";
import {EventsService} from "../services/events.service";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {Router} from "@angular/router";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-find-rescue-events',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    AsyncPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltip
  ],
  templateUrl: './find-rescue-events.component.html',
  styleUrl: './find-rescue-events.component.scss'
})
export class FindRescueEventsComponent implements OnInit {
  filterForm!: FormGroup;
  rescueEvents: any[] = [];
  isFiltersLoaded = false;
  isLoading = false;
  pets$!: Observable<any>;
  breeds$!: Observable<any>;
  countries$!: Observable<any>;
  cities$!: Observable<any>;
  savedEventIds: string[] = [];

  constructor(private fb: FormBuilder, private eventsService: EventsService, private router: Router) {
    this.filterForm = this.fb.group({
      gender: [''],
      minAge: [''],
      maxAge: [''],
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
    }).subscribe(({pets, countries}) => {
      this.pets$ = of(pets);
      this.countries$ = of(countries);
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

  loadFilters() {
    this.pets$ = this.eventsService.getPets();
    this.countries$ = this.eventsService.getCountries();
  }

  fetchEvents() {
    this.isLoading = true;

    const filters = this.filterForm.value;
    const params = {
      ...filters,
      breedIds: Array.isArray(filters.breedIds) ? filters.breedIds.join(',') : '',
    };

    forkJoin({
      events: this.eventsService.getFilteredRescueEvents(params),
      saved: this.eventsService.getSavedEventsByEventTypeId(2)
    }).subscribe({
      next: ({ events, saved }) => {
        this.rescueEvents = Array.isArray(events)
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

  goToEvent(eventId: string) {
    this.router.navigate(['/app-find-rescue-events', eventId]);
  }

  isEventSaved(eventId: string): boolean {
    return this.savedEventIds.includes(eventId);
  }

  toggleSave(event: any, clickEvent: MouseEvent) {
    clickEvent.stopPropagation(); // prevent navigation

    const isSaved = this.isEventSaved(event.id);
    const eventId = event.id;

    const action$ = isSaved
      ? this.eventsService.unsaveEvent(eventId, 2)
      : this.eventsService.saveEvent(eventId, 2);

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
