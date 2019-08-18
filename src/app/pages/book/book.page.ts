import { Component, OnInit } from '@angular/core';

import { DatabaseService, Book } from './../../services/database.service';

import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit {

  book: Book = null;

  constructor(
    private route: ActivatedRoute,
    private db: DatabaseService,
    private router: Router,
    private toast: ToastController,
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const bookId = parseInt(params.get('id'), 10);
      this.db.getBook(bookId).then(data => {
        this.book = data;
      });
    });
  }

  deleteBook() {
    this.db.deleteBook(this.book.id).then(() => {
      this.router.navigateByUrl('/');
    });
  }

  updateBook() {
    this.db.updateBook(this.book).then(async () => {
      const toast = await this.toast.create({
        message: 'Book updated',
        duration: 1500
      });
      toast.present();
    });
  }

}
