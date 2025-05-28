import {Component, OnInit} from '@angular/core';
import {EventsService} from "../services/events.service";
import {ActivatedRoute} from "@angular/router";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";

@Component({
  selector: 'app-lost-animal-event-page',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    DatePipe,
    NgForOf
  ],
  templateUrl: './lost-animal-event-page.component.html',
  styleUrl: './lost-animal-event-page.component.scss'
})
export class LostAnimalEventPageComponent implements OnInit{
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
    private fb: FormBuilder,
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
    this.eventService.getLostAnimalEventById(eventId).subscribe({
      next: (data) => {
        this.event = this.transformEventData(data);
        this.loading = false;
      },
      error: () => {
        console.log('lostAnimalEvent not found');
        this.loading = false;
      },
    });
  }

  transformEventData(event: any) {
    return {
      ...event,
      photo: event.photo ? `data:image/jpeg;base64,${event.photo}` : null,
      pet: event.pet.name,
      breed: event.breed.name,
      color: event.color.name,
    };
  }

  // comment functions
  loadComments(eventId: string) {
    this.eventService.getCommentsByEventType(eventId, 3).subscribe((res) => {
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

    this.eventService.createComment(eventId, { text }, 3).subscribe(() => {
      this.commentForm.reset();
      this.loadComments(eventId);
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
}
