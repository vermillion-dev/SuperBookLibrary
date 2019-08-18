import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { DatabaseService, Book } from './../../services/database.service';
import { BookApiService} from './../../services/book-api.service';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
})
export class BooksPage implements OnInit {

  private books: Book[];
  private book: FormGroup;

  selectedView = 'books';

  constructor(
    private db: DatabaseService,
    private barcodeScanner: BarcodeScanner,
    private bookApi: BookApiService,
    private toast: ToastController,
    private formBuilder: FormBuilder
  ) {
    this.books = [];
    this.book = this.formBuilder.group({
      id: [''],
      ean: ['', Validators.compose([Validators.required, BooksPage.isEan])],
      title: ['', Validators.required],
      volumeNumber: [''],
      desinator: [''],
      scriptwriter: [''],
      publisher: [''],
      type: [''],
      genre: [''],
      publishDate: [''],
      pageNumber: ['', BooksPage.nonZero]
    });
  }

  static isEan(control: AbstractControl): { [key: string]: any; } {
    if (String(control.value).length !== 13) {
      return {isEan: true};
    } else {
      return null;
    }
  }

  static nonZero(control: AbstractControl): { [key: string]: any; } {
    if (Number(control.value) <= 0) {
      return {nonZero: true};
    } else {
      return null;
    }
  }

  ngOnInit() {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getBooks().subscribe(books => {
          this.books = books;
        });
      }
    });
  }

  addBook() {
    this.db.addBook(this.book.value as Book).then(async resp => {
      const toast = await this.toast.create({
        message: 'Book added',
        duration: 1500
      });
      this.book.reset(new Book());
      toast.present();
    });
  }

  deleteBook(book: Book) {
    this.db.deleteBook(book.id);
  }

  updateBook(book: Book) {
    this.db.updateBook(book);
  }

  scan() {
    this.barcodeScanner.scan().then(data => {
      this.loadBook(Number(data.text));
    });
  }

  loadBook(ean: number) {
    this.bookApi.loadBook(ean);
    this.bookApi.getBook().subscribe(book => {
      this.book.setValue(book);
    });
  }
}
