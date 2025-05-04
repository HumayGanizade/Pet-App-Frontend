import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {EventsService} from "../services/events.service";
import {forkJoin, Observable, of} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatCardModule} from "@angular/material/card";
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";

@Component({
  selector: 'app-create-lost-animal-event',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgIf,
    AsyncPipe, NgForOf,
    CdkTextareaAutosize
  ],
  templateUrl: './create-lost-animal-event.component.html',
  styleUrl: './create-lost-animal-event.component.scss'
})
export class CreateLostAnimalEventComponent implements OnInit{
  filterForm: FormGroup;
  isLoading = false;
  isFiltersLoaded = false;
  imageUrl: string | null = null;
  pets$!: Observable<{ id: string, name: string }[]>;
  breeds$!: Observable<{ id: string, name: string }[]>;
  countries$!: Observable<{ id: string, name: string }[]>;
  cities$!: Observable<{ id: string, name: string }[]>;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private fb: FormBuilder, private eventsService: EventsService) {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      photo: [''],
      info: ['', Validators.required],
      location: ['', Validators.required],
      reward: [null, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      contact_number: ['', Validators.required],
      gmail: ['', [Validators.required, Validators.email]],
      petId: ['', Validators.required],
      breedId: ['', Validators.required],
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
    })
  }

  ngOnInit() {
    console.log('LOST ANIMAL COMPONENT LOADED');
    this.isFiltersLoaded = false;
    forkJoin({
      pets: this.fetchPets(),
      countries: this.fetchCountries(),
    }).subscribe(({ pets, countries }) => {
      this.pets$ = of(pets);
      this.countries$ = of(countries);
      this.isFiltersLoaded = true;
    });

    this.breeds$ = this.filterForm.get('petId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(petId => petId ? this.fetchBreeds(petId) : of([]))
    );


    this.cities$ = this.filterForm.get('countryId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(countryId => countryId ? this.fetchCities(countryId) : of([]))
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
    const formValue = this.filterForm.value;
    const formattedDate = new Date(formValue.date).toISOString().split('T')[0];
    const eventData = {
      ...formValue,
      date: formattedDate,
      petId: formValue.petId,
      breedId: formValue.breedId,
      photo: formValue.photo,
    };

    this.eventsService.createLostAnimalEvent(eventData).subscribe({
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
}
