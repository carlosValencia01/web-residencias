import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';
import { ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StudentProvider {
    constructor(
        public api: Api,
        private http: HttpClient,
    ) {

    }

    getApiURL() {
        return this.api.getURL();
    }

    getAllStudents() {
        return this.api.get('student')
            .pipe(map(students => students.json()));
    }

    getStudentById(_id) {
        return this.api.get(`student/${_id}`)
            .pipe(map(student => student.json()));
    }

    getStudentByControlNumber(controlnumber) {
        console.log(controlnumber);
        return this.api.post(`student/login`, controlnumber)
            .pipe(map(student => student.json()));
    }

    getProfileImage(id) {
        return this.api.get(`student/image/${id}`, { responseType: ResponseContentType.Blob })
            .pipe(map((res: Response) => res.blob()));
    }

    updateStudent(id, data) {
        return this.api.put(`student/${id}`, data)
            .pipe(map(student => student.json()));
    }

    // updatePhoto(id, data) {
    //     return this.api.put(`student/image/${id}`, data)
    //         .pipe(map(student => student.json()));
    // }

    searchStudents(text: string, start?: number, limit?: number) {
        const trueStart = start || 0;
        const trueLimit = limit || 15;

        return this.api.get(`student/search/${text}`, {
            start: trueStart,
            limit: trueLimit
        }).pipe(map(res => res.json()));
    }

    newStudent(data) {
        return this.api.post(`student/create`, data)
            .pipe(map(student => student.json()));
    }

    getImageTest(id: string): Observable<Blob> {
        return this.http.get(`${this.api.getURL()}/student/image/${id}`, { responseType: 'blob' });
    }

    updatePhoto(id, fd) {
        return this.http.put(`${this.api.getURL()}/student/image/${id}`, fd);
    }

    verifyStatus(nc) {
        return this.api.get(`student/verifystatus/${nc}`)
            .pipe(map(student => student.json()));
    }

    csvEnglish(data: any) {
        return this.api.post(`student/csv`, data).pipe(map(res => res.json()));
    }

    searchStudentWithEnglish(search: string) {
        return this.api.get(`english/search/${search}`).pipe(map(res => res.json()));
    }

    csvAddStudentEnglish(data: any) {
        return this.api.post(`english/create`, data).pipe(map(res => res.json()));
    }

    csvRemoveStudentEnglish(id: string) {
        return this.api.delete(`english/remove/${id}`).pipe(map(res => res.json()));
    }

    StudentWithEnglish() {
        return this.api.get(`english/`).pipe(map(res => res.json()));
    }

    request(id, data) {
        return this.api.post(`request/create/${id}`, data, true).pipe(map(res => res.json()));
    }

    updateRequest(id, data) {
        return this.api.put(`request/${id}`, data, true).pipe(map(res => res.json()));
    }

    addIntegrants(id, data) {
        return this.api.put(`request/${id}/integrants`, data, true).pipe(map(res => res.json()));
    }
    getRequest(id) {
        return this.api.get(`student/request/${id}`).pipe(map(res => res.json()));
    }

    getResource(id: string, resource: string): Observable<Blob> {
        return this.http.get(`${this.api.getURL()}/student/${resource.toLocaleLowerCase()}/${id}`, { responseType: 'blob' });

    }
}