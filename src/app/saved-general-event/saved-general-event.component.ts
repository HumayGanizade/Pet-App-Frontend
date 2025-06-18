import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
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
import {EventsService} from "../services/events.service";
import {Router} from "@angular/router";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";

@Component({
  selector: 'app-saved-general-event',
  standalone: true,
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
    MatProgressSpinnerModule,
    MatTooltip
  ],
  templateUrl: './saved-general-event.component.html',
  styleUrl: './saved-general-event.component.scss'
})
export class SavedGeneralEventComponent implements OnInit{
  filterForm: FormGroup;
  events: any[] = [];
  isLoading = false;
  isFiltersLoaded = false;
  pets$!: Observable<{ id: string, name: string }[]>;
  breeds$!: Observable<{ id: string, name: string }[]>;
  countries$!: Observable<{ id: string, name: string }[]>;
  cities$!: Observable<{ id: string, name: string }[]>;
  types$!: Observable<{ name: string }[]>;
  savedEventIds: string[] = [];

  constructor(private eventsService: EventsService, private fb: FormBuilder, private router: Router) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      type: [''],
      minPrice: [''],
      maxPrice: [''],
      countryId: [''],
      cityId: [''],
      petsIds: [[]],
      breedIds: [[]],
      name: [''],
    });
  }

  ngOnInit() {
    this.isFiltersLoaded = false;
    this.fetchSavedEvents();
    forkJoin({
      countries: this.fetchCountries(),
      pets: this.fetchPets(),
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

    this.breeds$ = this.filterForm.get('petsIds')!.valueChanges.pipe(
      startWith([]),
      distinctUntilChanged(),
      switchMap((petIds: string[]) => {
        if (!petIds || petIds.length === 0) return of([]);

        const breedObservables = petIds.map(petId => this.fetchBreeds(petId));

        return forkJoin(breedObservables).pipe(
          map(breedsArrays => {
            const allBreeds = breedsArrays.flat();
            return allBreeds.filter(
              (breed, index, self) =>
                index === self.findIndex(b => b.id === breed.id)
            );
          })
        );
      })
    );
  }

  fetchSavedEvents() {
    this.isLoading = true;

    const formValue = this.filterForm.value;

    const params = {
      ...formValue,
      petsIds: Array.isArray(formValue.petsIds) ? formValue.petsIds.join(',') : '',
      breedIds: Array.isArray(formValue.breedIds) ? formValue.breedIds.join(',') : '',
    };

    forkJoin({
      allFiltered: this.eventsService.getFilteredEvents(params),
      saved: this.eventsService.getSavedEventsByEventTypeId(1)
    }).subscribe({
      next: ({ allFiltered, saved }) => {
        const savedIds = saved.map((e: any) => e.id);

        this.events = allFiltered
          .filter((event: any) => savedIds.includes(event.id))
          .map((event: any) => ({
            ...event,
            photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
          }));

        this.savedEventIds = savedIds;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load filtered saved events:', err);
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

  async goToEvent(eventId: string) {
    try {
      await this.router.navigate(['/app-find-events', eventId]);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }


  unsaveEvent(eventId: string, event: MouseEvent) {
    event.stopPropagation();
    this.eventsService.unsaveEvent(eventId, 1).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== eventId);
      },
      error: (err) => {
        console.error('Failed to unsave event:', err);
      }
    });
  }
}
