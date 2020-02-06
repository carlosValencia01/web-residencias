import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';


@Injectable()
export class BookProvider {
    constructor(public api: Api) { }

    getAllBooks() {
        return this.api.get(`minuteBook/getAll`)
            .pipe(map(books => books.json()));
    }

    newBook(data) {
        return this.api.post(`minuteBook/create`, data)
            .pipe(map(book => book.json()));
    }


    updateBook(id, data) {
        return this.api.put(`minuteBook/changeStatus/${id}`, data)
            .pipe(map(book => book.json()));
    }
}
