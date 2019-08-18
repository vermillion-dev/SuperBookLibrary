import { Injectable } from '@angular/core';

import { DatabaseService, Book } from './../services/database.service';

import { HTTP } from '@ionic-native/http/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookApiService {

  private bookSave: Book;
  private book: BehaviorSubject<Book>;

  constructor(private http: HTTP) {
    this.bookSave = new Book();
    this.book = new BehaviorSubject(this.bookSave);
  }

  getBook(): Observable<Book> {
    return this.book.asObservable();
  }

  loadBook(ean: number) {
    this.bookSave.ean = ean;
    this.book.next(this.bookSave);
    this.http.get('https://www.manga-news.com/index.php/recherche/?q=' + ean, {}, {})
    .then(dataSearch => {
      const htmlSearch = document.createElement( 'html' );
      htmlSearch.innerHTML = dataSearch.data;
      const elem: HTMLAnchorElement = htmlSearch.querySelector('#searchAccordion a');
      if (elem) {
        const title = elem.innerText.trim();
        const regexVolNum = /vol\.\d+/g;
        this.bookSave.title = title.replace(regexVolNum, '').trim();
        this.bookSave.volumeNumber = parseInt(title.match(regexVolNum)[0].replace('vol.', '').trim(), 10);
        this.book.next(this.bookSave);
      }
      this.http.get(elem.href, {}, {})
      .then(dataResult => {
        const htmlResult = document.createElement( 'html' );
        htmlResult.innerHTML = dataResult.data;
        const infos = htmlResult.querySelector('#topinfo');
        if (infos) {
          const desinator: HTMLAnchorElement = infos.querySelector('a[title="Dessinateur"][itemprop="author"]');
          this.bookSave.desinator = desinator && desinator.innerText.trim();

          const scriptwriter: HTMLAnchorElement = infos.querySelector('a[title="Scénariste"][itemprop="author"]');
          this.bookSave.scriptwriter = desinator && scriptwriter.innerText.trim();

          const publisher: HTMLAnchorElement = infos.querySelector('a[itemprop="publisher"]');
          this.bookSave.publisher = publisher && publisher.innerText.trim();

          const type = [].filter.call(infos.getElementsByTagName('li'), (el: HTMLLIElement) => {
            return RegExp(/Type:/g).test(el.innerText);
          });
          this.bookSave.type = type.length && type[0].querySelector('a').innerText.trim();

          const genre: NodeListOf<HTMLAnchorElement> = infos.querySelectorAll('a[itemprop="genre"]');
          this.bookSave.genre = genre && [].map.call(genre, (el: HTMLAnchorElement) =>  el.innerText.trim());

          const publishDate: HTMLMetaElement = infos.querySelector('meta[itemprop="datePublished"]');
          this.bookSave.publishDate = publishDate && new Date(publishDate.content);

          const pageNumber: HTMLSpanElement = infos.querySelector('span[itemprop="numberOfPages"]');
          this.bookSave.pageNumber = pageNumber && parseInt(pageNumber.innerText.trim(), 10);
        }
        this.book.next(this.bookSave);
      });
    })
    .catch(error => {

      console.log(error.status);
      console.log(error.error); // error message as string
      console.log(error.headers);

    });
  }
}
