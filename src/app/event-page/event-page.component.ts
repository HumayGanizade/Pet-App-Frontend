import { Component, OnInit } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { EventsService } from '../services/events.service';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";

@Component({
  selector: 'event-page',
  standalone: true,
  imports: [NgIf, NgForOf, ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    DatePipe,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.scss'],
})
export class EventPageComponent implements OnInit {
  event: any;
  loading: boolean = true;
  comments: any[] = [];
  replies: { [key: string]: any[] } = {};
  commentForm!: FormGroup;
  replyForms: { [key: string]: FormGroup } = {};
  editingCommentId: string | null = null;
  editingText: string = '';

  constructor(
    private eventService: EventsService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.commentForm = this.fb.group({
      text: [''],
    });

    this.route.paramMap.subscribe((params) => {
      const eventId = params.get('id');
      if (eventId) {
        this.getEventById(eventId);
        this.loadComments(eventId);
      }
    });
  }

  getEventById(eventId: string) {
    this.eventService.getEventById(eventId).subscribe({
      next: (data) => {
        this.event = this.transformEventData(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  transformEventData(event: any) {
    return {
      ...event,
      startDate: this.datePipe.transform(event.startDate, 'dd.MM.yyyy'),
      endDate: this.datePipe.transform(event.endDate, 'dd.MM.yyyy'),
      pets: event.pets?.map((pet: { name: string }) => pet.name) || [],
      breeds: event.breeds?.map((breed: { name: string }) => breed.name) || [],
      photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
    };
  }

  // comment functions
  loadComments(eventId: string) {
    this.eventService.getCommentsByEventType(eventId, 1).subscribe((res) => {
      this.comments = res;
      console.log(this.comments);
      this.comments.forEach((comment) => this.loadReplies(comment.id));
    });
  }

  loadReplies(commentId: string) {
    this.eventService.getRepliesOfComment(commentId).subscribe((res) => {
      this.replies[commentId] = res;
      this.replyForms[commentId] = this.fb.group({ text: [''] });
    });
  }

  addComment(eventId: string) {
    const text = this.commentForm.value.text;
    if (!text) return;

    this.eventService.createComment(eventId, { text }, 1).subscribe(() => {
      this.commentForm.reset();
      this.loadComments(eventId);
    });
  }

  addReply(commentId: string, eventId: string) {
    const text = this.replyForms[commentId].value.text;
    if (!text) return;

    this.eventService.createReplyToComment(commentId, { text }).subscribe(() => {
      this.replyForms[commentId].reset();
      this.loadComments(eventId); // Refresh after reply
    });
  }

  editComment(commentId: string) {
    if (!this.editingText.trim()) return; // Проверка на пустой текст

    this.eventService.editCommentById(commentId, { text: this.editingText }).subscribe(() => {
      this.editingCommentId = null;
      this.editingText = '';
      this.loadComments(this.event.id); // Перезагружаем комментарии
    });
  }


  deleteComment(commentId: string) {
    this.eventService.deleteCommentById(commentId).subscribe(() => {
      this.loadComments(this.event.id);
    });
  }

  setEditing(commentId: string, text: string) {
    this.editingCommentId = commentId;
    this.editingText = text;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingText = '';
  }


  getPetsNames(pets: any[]): string {
    return pets && pets.length > 0
      ? pets.join(', ')
      : 'No breeds';
  }

  getBreedNames(breeds: any[]): string {
    return breeds && breeds.length > 0
      ? breeds.join(', ')
      : 'No breeds';
  }
}
