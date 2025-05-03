import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';
import { EventsService } from '../services/events.service';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";
import {MatDatepicker, MatDatepickerModule, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatNativeDateModule, MatOption} from "@angular/material/core";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-create-events',
  templateUrl: './create-event.component.html',
  standalone: true,
    imports: [
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatGridListModule,
    MatCardModule,
    FormsModule,
    MatDatepicker,
    MatDatepickerModule,
    MatDatepickerToggle,
    MatNativeDateModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatOption,
    MatSelect,
    NgForOf,
    NgIf,
  ],
  styleUrl: './create-event.component.scss'
})
export class CreateEventComponent implements OnInit {
  imageUrl: string | null = null;
  filterForm: FormGroup;
  isLoading = false;
  isFiltersLoaded = false;
  pets$!: Observable<{ id: string, name: string }[]>;
  breeds$!: Observable<{ id: string, name: string }[]>;
  countries$!: Observable<{ id: string, name: string }[]>;
  cities$!: Observable<{ id: string, name: string }[]>;
  types$!: Observable<{ name: string }[]>;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private eventsService: EventsService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      type: ['', Validators.required],
      price: ['', Validators.required],
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
      petIds: [[]],
      breedIds: [[]],
      photo: [''],
      location: ['', Validators.required],
      info: ['', Validators.required],
      plan: [''],
      contact_number: ['', Validators.required],
      gmail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.isFiltersLoaded = false;
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
      switchMap(countryId => countryId ? this.fetchCities(countryId) : of([]))
    );

    this.breeds$ = this.filterForm.get('petIds')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(petId => petId ? this.fetchBreeds(petId) : of([]))
    );
  }

  uploadImage(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1]; // Extract only Base64 part
        this.imageUrl = e.target?.result as string; // Keep full Base64 for preview
        this.filterForm.patchValue({ photo: base64String }); // Save only Base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  createEvent() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;

    const eventData = {
      ...this.filterForm.value,
      petsIds: Array.isArray(this.filterForm.value.petIds) ? this.filterForm.value.petIds : [],
      breedIds: Array.isArray(this.filterForm.value.breedIds) ? this.filterForm.value.breedIds : [],
      photo: this.filterForm.value.photo,
    };

    this.eventsService.createEvent(eventData).subscribe({
      next: (response) => {
        console.log('Event created successfully', response);
        this.isLoading = false;
        alert('Event was successfully created!');
        this.filterForm.reset();
        this.imageUrl = null;
      },
      error: (error) => {
        console.error('Error creating event:', error);
        this.isLoading = false;
        alert('Failed to create event. Please try again.');
      },
    });
  }

  private fetchPets() {
    return this.eventsService.getPets().pipe(
      map((pets: any) => pets.map((pet: any) => ({ id: pet.id, name: pet.name })).sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name)))
    );
  }

  private fetchCountries() {
    return this.eventsService.getCountries().pipe(
      map((countries: any) => countries.map((country: any) => ({ id: country.id, name: country.name })).sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name)))
    );
  }

  private fetchCities(countryId: string) {
    return this.eventsService.getAllCitiesByCountryId(countryId).pipe(
      map((cities: any) => cities.map((city: any) => ({ id: city.id, name: city.name })).sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name)))
    );
  }

  private fetchBreeds(petId: string) {
    return this.eventsService.getAllBreedsByPetId(petId).pipe(
      map((breeds: any) => breeds.map((breed: any) => ({ id: breed.id, name: breed.name })).sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name)))
    );
  }

  private fetchTypes() {
    return this.eventsService.getEventTypes().pipe(
      map((types: any) => types.map((type: any) => ({ name: type.name })))
    );
  }
}
