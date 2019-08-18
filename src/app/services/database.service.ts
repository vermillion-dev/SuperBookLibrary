import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

export class Book {
  id: number = null;
  ean: number = null;
  title: string = null;
  volumeNumber: number = null;
  desinator: string = null;
  scriptwriter: string = null;
  publisher: string = null;
  type: string = null;
  genre: string = null;
  publishDate: Date = null;
  pageNumber: number = null;

  constructor() {}
}


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private books = new BehaviorSubject([]);

  constructor(private plt: Platform, private sqlite: SQLite) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'books.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.database = db;
          db.executeSql(`CREATE TABLE IF NOT EXISTS books(
                                                          id INTEGER PRIMARY  KEY             AUTOINCREMENT,
                                                          ean                 NUMBER(13)      UNIQUE CHECK(LENGTH(ean) == 13),
                                                          title               TEXT,
                                                          volume_number       NUMBER,
                                                          desinator           TEXT,
                                                          scriptwriter        TEXT,
                                                          publisher           TEXT,
                                                          type                TEXT,
                                                          genre               TEXT,
                                                          publish_date        DATE,
                                                          page_number         INT             CHECK(page_number > 0),
                                                          UNIQUE(title, volume_number)
                                                        )`, [])
      .catch(e => console.log(e));
      }).then(() => {
        this.loadBooks();
        this.dbReady.next(true);
      });
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getBooks(): Observable<Book[]> {
    return this.books.asObservable();
  }

  async loadBooks() {
    return this.database.executeSql('SELECT * FROM books', []).then(data => {
      const books: Book[] = [];

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          const row = data.rows.item(i);
          books.push({
            id: row.id,
            ean: row.ean,
            title: row.title,
            volumeNumber: row.volume_number,
            desinator: row.desinator,
            scriptwriter: row.scriptwriter,
            publisher: row.publisher,
            type: row.type,
            genre: row.genre,
            publishDate: row.publish_date,
            pageNumber: row.page_number,
           });
        }
      }
      this.books.next(books);
    });
  }

  async addBook(book: Book) {
    const data = [
      book.ean,
      book.title,
      book.volumeNumber,
      book.desinator,
      book.scriptwriter,
      book.publisher,
      book.type,
      book.genre.toString(),
      book.publishDate ? book.publishDate.toISOString() : null,
      book.pageNumber
    ];
    return this.database.executeSql(`INSERT INTO books (
                                                        ean,
                                                        title,
                                                        volume_number,
                                                        desinator,
                                                        scriptwriter,
                                                        publisher,
                                                        type,
                                                        genre,
                                                        publish_date,
                                                        page_number
                                                      )
                                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, data)
    .then(() => {
      this.loadBooks();
    });
  }

  async getBook(id: number): Promise<Book> {
    return this.database.executeSql('SELECT * FROM books WHERE id = ?', [id]).then(data => {
      const row = data.rows.item(0);
      return {
        id: row.id,
        ean: row.ean,
        title: row.title,
        volumeNumber: row.volume_number,
        desinator: row.desinator,
        scriptwriter: row.scriptwriter,
        publisher: row.publisher,
        type: row.type,
        genre: row.genre,
        publishDate: row.publish_date,
        pageNumber: row.page_number,
      };
    });
  }

  async deleteBook(id: number) {
    return this.database.executeSql('DELETE FROM books WHERE id = ?', [id]).then(() => {
      this.loadBooks();
    });
  }

  async updateBook(book: Book) {
    const data = [book.ean, book.title];
    return this.database.executeSql(`UPDATE books SET ean = ?,
                                                      title = ?,
                                                      volume_number = ?,
                                                      desinator = ?,
                                                      scriptwriter = ?,
                                                      publisher = ?,
                                                      type = ?,
                                                      genre = ?,
                                                      publish_date = ?,
                                                      page_number = ?
                                                  WHERE id = ${book.id}`, data)
    .then(() => {
      this.loadBooks();
    });
  }
}
