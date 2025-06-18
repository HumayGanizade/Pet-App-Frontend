import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'http://localhost:41433/events/getFilteredEvents';
  private eventUrl = 'http://localhost:41433/events';
  private apiTypes = 'http://localhost:41433/dropdown-info/getEventTypes';
  private apiPets = 'http://localhost:41433/dropdown-info/pets';
  private apiBreeds = 'http://localhost:41433/dropdown-info/getAllBreedsByPetId';
  private apiCountries = 'http://localhost:41433/dropdown-info/getAllCountries';
  private apiCities = 'http://localhost:41433/dropdown-info/getAllCitiesByCountryId';
  private justApi = 'http://localhost:41433';

  constructor(private http: HttpClient) {}

  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  getEventById(eventId: string) {
    return this.http.get<any>(`${this.eventUrl}/getEventById/${eventId}`);
  }

  getRescueEventById(rescueEventId: string) {
    return this.http.get<any>(`${this.justApi}/rescue-event/getById/${rescueEventId}`);
  }

  getLostAnimalEventById(lostAnimalEventId: string) {
    return this.http.get<any>(`${this.justApi}/lost-animal-event/${lostAnimalEventId}`);
  }

  createEvent(body: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.eventUrl}/${userId}`, body, { headers });
  }

  getFilteredEvents(filters: any): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          params = params.set(key, filters[key].join(',')); // Join array values with a comma
        } else {
          params = params.set(key, filters[key]);
        }
      }
    });

    return this.http.get<any>(this.apiUrl, { params });
  }

  getFilteredRescueEvents(filters: any): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          params = params.set(key, filters[key].join(','));
        } else {
          params = params.set(key, filters[key]);
        }
      }
    });

    return this.http.get<any>(`${this.justApi}/rescue-event/getAll`, { params });
  }

  getFilteredLostAnimalsEvents(filters: any): Observable<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          params = params.set(key, filters[key].join(','));
        } else {
          params = params.set(key, filters[key]);
        }
      }
    });

    return this.http.get<any>(`${this.justApi}/lost-animal-event`, { params });
  }

  getEventsByUserId(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.eventUrl}/getAllEventsByUserId/${userId}`, { headers })
  }

  getRescueEventsByUserId(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.justApi}/rescue-event/getAllByUserId/${userId}`, { headers })
  }

  getLostAnimalEventsByUserId(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.justApi}/lost-animal-event/getAllByUserId/${userId}`, { headers })
  }

  getEventTypes() {
    return this.http.get(this.apiTypes);
  }

  getPets() {
    return this.http.get(this.apiPets);
  }

  getAllBreedsByPetId(id: string) {
    return this.http.get(`${this.apiBreeds}/${id}`);
  }

  getCountries() {
    return this.http.get(this.apiCountries);
  }

  getAllCitiesByCountryId(id: string) {
    return this.http.get(`${this.apiCities}/${id}`);
  }

  getColors() {
    return this.http.get(`${this.justApi}/dropdown-info/getAllPetColors`);
  }

  getGeneralEventTypes() {
    return [
      {
        id: 1,
        name: "general"
      },
      {
        id: 2,
        name: "rescue"
      },
      {
        id: 3,
        name: "lost animals"
      }
    ]
  }

  deleteEventById(id: string) {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.delete(`${this.eventUrl}/${id}`, { headers })
  }

  deleteRescueEventById(id: string) {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.justApi}/rescue-event/${id}`, { headers })
  }

  deleteLostAnimalEventById(id: string) {
    const token = localStorage.getItem('authToken');
    const userId = this.getUserIdFromToken();

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.justApi}/lost-animal-event/${id}`, { headers })
  }

  createRescueEvent(data: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.justApi}/rescue-event`, data, { headers });
  }

  createLostAnimalEvent(data: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.justApi}/lost-animal-event`, data, { headers });
  }

  editEventById(id: string | null | undefined, data: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.justApi}/events/${id}`, data, { headers });
  }

  editRescueEventById(id: string | null | undefined, data: any): Observable<any>  {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.justApi}/rescue-event/${id}`, data, { headers });
  }

  editLostAnimalEventById(id: string | null | undefined, data: any): Observable<any>  {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Auth token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.justApi}/lost-animal-event/${id}`, data, { headers });
  }

  //comment
  createComment(eventId: string, body: any, eventTypeId: number ) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.justApi}/comment/${eventId}/${eventTypeId}`, body, { headers });
  }

  createReplyToComment(commentId: string, body: any) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.justApi}/comment/${commentId}`, body, { headers });
  }

  getCommentsByEventType(eventId: string, eventTypeId: number) {
    return this.http.get<any>(`${this.justApi}/comment/getCommentsByEventType/${eventId}/${eventTypeId}`);
  }

  getRepliesOfComment(commentId: string) {
    return this.http.get<any>(`${this.justApi}/comment/getRepliesOfComment/${commentId}`);
  }

  editCommentById(commentId: string, body: any) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put<any>(`${this.justApi}/comment/${commentId}`, body, { headers });
  }

  deleteCommentById(commentId: string) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete<any>(`${this.justApi}/comment/${commentId}`, { headers });
  }

  saveEvent(eventId: number, eventTypeId: number) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.justApi}/saved-event/addEventToUser/${eventId}/${eventTypeId}`,{}, { headers });
  }

  unsaveEvent(eventId: string, eventTypeId: number) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete<any>(`${this.justApi}/saved-event/remove/${eventId}/${eventTypeId}`, { headers });
  }

  getSavedEventsByEventTypeId(eventTypeId: number) {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Auth token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.justApi}/saved-event/getAllSavedEventsOfUserByEventTypeId/${eventTypeId}`, { headers });
  }
}
