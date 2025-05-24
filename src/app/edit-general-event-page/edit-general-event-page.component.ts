import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {EventsService} from "../services/events.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {
  MatDatepicker,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {
  MatFormFieldModule,
} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule, MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {forkJoin, Observable, of} from "rxjs";
import {distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {MatGridListModule} from "@angular/material/grid-list";

@Component({
  selector: 'app-edit-general-event-page',
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
  templateUrl: './edit-general-event-page.component.html',
  styleUrl: './edit-general-event-page.component.scss'
})
export class EditGeneralEventPageComponent implements OnInit{
  imageUrl: string | null = null;
  filterForm: FormGroup;
  isLoading = false;
  isFiltersLoaded = false;
  currentEventId: string | null | undefined;
  pets$!: Observable<{ id: string, name: string }[]>;
  breeds$!: Observable<{ id: string, name: string }[]>;
  countries$!: Observable<{ id: string, name: string }[]>;
  cities$!: Observable<{ id: string, name: string }[]>;
  types$!: Observable<{ name: string }[]>;

  @ViewChild('fileInput') fileInput!: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.filterForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      type: ['', Validators.required],
      price: ['', Validators.required],
      countryId: ['', Validators.required],
      cityId: ['', Validators.required],
      petsIds: [[]],
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
    this.currentEventId = this.route.snapshot.paramMap.get('id');
    if (this.currentEventId) {
      this.loadEvent(this.currentEventId);
    }

    this.isFiltersLoaded = false;
    forkJoin({
      pets: this.fetchPets(),
      countries: this.fetchCountries(),
      types: this.fetchTypes()
    }).subscribe(({ pets, countries, types }) => {
      this.pets$ = of(pets);
      this.types$ = of(types);
      this.countries$ = of(countries);
      this.isFiltersLoaded = true;
    });

    this.cities$ = this.filterForm.get('countryId')!.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      switchMap(countryId => countryId ? this.fetchCities(countryId) : of([]))
    );

    this.breeds$ = this.filterForm.get('petsIds')!.valueChanges.pipe(
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

  loadEvent(id: string): void {
    this.eventsService.getEventById(id).subscribe(event => {
      this.filterForm.patchValue({
        name: event.name,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        type: event.type,
        price: event.price,
        countryId: event.countryId,
        cityId: event.cityId,
        petIds: event.petIds,
        breedIds: event.breedIds,
        location: event.location,
        info: event.info,
        plan: event.plan,
        contact_number: event.contact_number,
        gmail: event.gmail,
      });

      if (event.photo) {
        this.imageUrl = `data:image/jpeg;base64,${event.photo}`;
        this.filterForm.patchValue({ photo: event.photo });
      }
    });
  }

  updateEvent(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      alert('Please fix the errors in the form.');
      return;
    }

    const updatedEvent = {
      ...this.filterForm.value,
      petsIds: this.filterForm.value.petsIds,
      breedIds: this.filterForm.value.breedIds,
    };

    this.eventsService.editEventById(this.currentEventId, updatedEvent).subscribe({
      next: () => {
        alert('Event updated successfully!');
        this.router.navigate(['/edit-events']); // или куда нужно
      },
      error: err => {
        console.error('Update error:', err);
        alert('Failed to update event');
      }
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
