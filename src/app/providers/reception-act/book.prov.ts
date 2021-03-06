import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';


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

    getAllActiveBooks() {
        return this.api.get(`minuteBook/getAllActive`)
            .pipe(map(books => books.json()));
    }

    getActiveBookByCareer(careerId: string, titleOption?:string) {
        return this.api.get(`minuteBook/active/${careerId}/${titleOption}`)
            .pipe(map(res => res.json()));
    }

    updateInfoBook(id, data) {
        return this.api.put(`minuteBook/update/${id}`, data)
            .pipe(map(book => book.json()));
    }
}
