import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';
import { ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EmployeeProvider {
    constructor(
        public api: Api,
        private http: HttpClient,
    ) {

    }

    getApiURL() {
        return this.api.getURL();
    }

    getAllEmployee() {
        return this.api.get('employee')
            .pipe(map(students => students.json()));
    }

    getStudentById(_id) {
        return this.api.get(`employee/${_id}`)
            .pipe(map(student => student.json()));
    }

    getStudentByControlNumber(controlnumber) {
        console.log(controlnumber);
        return this.api.post(`student/login`, controlnumber)
            .pipe(map(student => student.json()));
    }

    getProfileImage(id) {
        return this.api.get(`employee/image/${id}`, { responseType: ResponseContentType.Blob })
            .pipe(map((res: Response) => res.blob()));
    }

    getEmployeesByDepto() {
        return this.api.get(`department/employees`).pipe(map(department => department.json()));
    }

    updateEmployee(id, data) {
        return this.api.put(`employee/${id}`, data)
            .pipe(map(student => student.json()));
    }

    searchEmployees(text: string, start?: number, limit?: number) {
        const trueStart = start || 0;
        const trueLimit = limit || 15;

        return this.api.get(`employee/search/${text}`, {
            start: trueStart,
            limit: trueLimit
        }).pipe(map(res => res.json()));
    }

    searchEmployeeRFC(text: string, start?: number, limit?: number) {
        const trueStart = start || 0;
        const trueLimit = limit || 15;

        return this.api.get(`employee/searchrfc/${text}`, {
            start: trueStart,
            limit: trueLimit
        }).pipe(map(res => res.json()));
    }

    newEmployee(data) {
        return this.api.post(`employee/create`, data)
            .pipe(map(student => student.json()));
    }


    getImageTest(id: string): Observable<Blob> {
        return this.http.get(`${this.api.getURL()}/employee/image/${id}`, { responseType: 'blob' });
    }

    updatePhoto(id, fd) {
        return this.http.put(`${this.api.getURL()}/employee/image/${id}`, fd);

    }

    searchEmployeeGrade(search: string) {
        return this.api.get(`employee/grade/search/${search}`).pipe(map(res => res.json()));
    }

    csvEmployeGrade(data: any) {
        return this.api.post(`employee/csv`, data).pipe(map(res => res.json()));
    }

    searchEmployeeByArea() {
        return this.api.get(`employee/area`).pipe(map(res => res.json()));
    }
}
