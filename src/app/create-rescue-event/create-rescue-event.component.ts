import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventsService } from '../services/events.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {forkJoin, Observable, of} from "rxjs";

@Component({
  selector: 'app-create-rescue-event',
  standalone: true,
  templateUrl: './create-rescue-event.component.html',
  styleUrls: ['./create-rescue-event.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule
  ]
})
export class CreateRescueEventComponent implements OnInit {
  isLoading = false;
  isFiltersLoaded = false;
  pets$!: Observable<{ id: string, name: string }[]>;
  breeds$!: Observable<{ id: string, name: string }[]>;
  countries$!: Observable<{ id: string, name: string }[]>;
  cities$!: Observable<{ id: string, name: string }[]>;

  @ViewChild('fileInput') fileInput!: ElementRef;
  imageUrl: string | null = null;
  form!: FormGroup;


  constructor(private fb: FormBuilder, private eventsService: EventsService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      photo: [''],
      info: ['', Validators.required],
      location: ['', Validators.required],
      contact_number: ['', Validators.required],
      gmail: ['', [Validators.required, Validators.email]],
      petId: ['', Validators.required],
      breedId: ['', Validators.required],
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.isFiltersLoaded = false;
    forkJoin({
      pets: this.fetchPets(),
      countries: this.fetchCountries(),
    }).subscribe(({ pets, countries }) => {
      this.pets$ = of(pets);
      this.countries$ = of(countries);
      this.isFiltersLoaded = true;
    });
    this.cities$ = this.form.get('countryId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(countryId => countryId ? this.fetchCities(countryId) : of([]))
    );

    this.breeds$ = this.form.get('petId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(petId => petId ? this.fetchBreeds(petId) : of([]))
    );
  }

  private fetchPets() {
    return this.eventsService.getPets().pipe(
      map((pets: any) => pets.map((pet: any) => ({ id: pet.id, name: pet.name })).sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name)))
    );
  }

  private fetchBreeds(petId: string) {
    return this.eventsService.getAllBreedsByPetId(petId).pipe(
      map((breeds: any) => breeds.map((breed: any) => ({ id: breed.id, name: breed.name })).sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name)))
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

  uploadImage(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        this.imageUrl = e.target?.result as string;
        this.form.patchValue({ photo: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;

    this.eventsService.createRescueEvent(this.form.value).subscribe({
      next: () => {
        alert('Rescue event created successfully!');
        this.isLoading = false;
        this.form.reset();
        this.imageUrl = null;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
        alert('Failed to create rescue event.');
      }
    });
  }

}
