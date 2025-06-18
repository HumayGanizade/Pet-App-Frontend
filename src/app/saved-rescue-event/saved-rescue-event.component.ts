import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTooltip} from "@angular/material/tooltip";
import {forkJoin, Observable, of} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {EventsService} from "../services/events.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-saved-rescue-event',
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
  templateUrl: './saved-rescue-event.component.html',
  styleUrl: './saved-rescue-event.component.scss'
})
export class SavedRescueEventComponent implements OnInit {
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

  fetchEvents() {
    this.isLoading = true;

    const f = this.filterForm.value;
    const params = {
      ...f,
      breedIds: Array.isArray(f.breedIds) ? f.breedIds.join(',') : '',
    };

    forkJoin({
      filtered: this.eventsService.getFilteredRescueEvents(params),
      saved:    this.eventsService.getSavedEventsByEventTypeId(2)
    }).subscribe({
      next: ({ filtered, saved }) => {
        const savedIds = new Set(saved.map((e: any) => e.id));

        this.rescueEvents = Array.isArray(filtered)
          ? filtered
            .filter((ev: any) => savedIds.has(ev.id))
            .map(ev => ({
              ...ev,
              photo: ev.photo ? `data:image/jpeg;base64,${ev.photo}` : null,
            }))
          : [];

        this.savedEventIds = [...savedIds] as string[];
        this.isLoading = false;
      },
      error: err => {
        console.error('Error fetching filtered-saved events', err);
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

  goToEvent(eventId: string) {
    this.router.navigate(['/app-find-rescue-events', eventId]);
  }

  isEventSaved(eventId: string): boolean {
    return this.savedEventIds.includes(eventId);
  }

  unsaveEvent(eventId: string, e: MouseEvent) {
    e.stopPropagation();
    this.eventsService.unsaveEvent(eventId, 2).subscribe({
      next: () => {
        this.rescueEvents = this.rescueEvents.filter(ev => ev.id !== eventId);
        this.savedEventIds = this.savedEventIds.filter(id => id !== eventId);
      },
      error: err => console.error('Failed to unsave:', err)
    });
  }
}
