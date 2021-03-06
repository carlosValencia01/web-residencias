import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';
import { ResponseContentType } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
@Injectable()
export class StudentProvider {

    private _refreshNeeded$ = new Subject<void>();

    get refreshNeeded$() {
        return this._refreshNeeded$;
    }

    constructor(
        public api: Api,
        private http: HttpClient,
    ) {

    }

    getStatusById(id: string) {
      return this.api.get(`user/student/status/${id}`)
        .pipe(map(students => students.json()));
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

    getStudentByControlNumber(controlNumber) {
        return this.api.post(`student/login`, { controlNumber: controlNumber })
            .pipe(map(student => student.json()));
    }

    getByControlNumber(controlNumber) {
        return this.api.post('student/search/numero', { controlNumber: controlNumber })
            .pipe(map(student => student.json()));
    }

    getByControlNumberSII(data: { controlNumber: string }) {
        return this.api.post('user/titled/register', data)
            .pipe(map(student => student.json()));
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

    releaseEnglishCsv(data: any) {
        return this.api.put(`english/release/csv`, data).pipe(map(res => res.json()));
    }

    // searchStudentWithEnglish(search: string) {
    //     return this.api.get(`english/search/${search}`).pipe(map(res => res.json()));
    // }

    studentsEnglishReleased() {
        return this.api.get(`english/released`).pipe(map(res => res.json()));
    }

    studentsEnglishNotReleased() {
        return this.api.get(`english/notReleased`).pipe(map(res => res.json()));
    }

    releaseEnglish(controlNumber: string) {
        const doc = {
            releaseDate: new Date(),
            type: 'Ingles'
        };
        return this.api.put(`english/release/${controlNumber}`, doc)
            .pipe(map(res => res.json()));
    }

    removeRelease(controlNumber: string) {
        return this.api.delete(`english/removeRelease/${controlNumber}`)
            .pipe(map(res => res.json()));
    }

    request(id, data) {
        return this.api.post(`request/create/${id}`, data, true).pipe(map(res => res.json()));
    }

    updateRequest(id, data) {
        return this.api.put(`request/${id}`, data, true).pipe(map(res => res.json()));
    }

    addIntegrants(id, data) {
        return this.api.put(`request/${id}/integrants`, data).pipe(map(res => res.json()));
    }

    getRequest(id) {
        return this.api.get(`student/request/${id}`).pipe(map(res => res.json()));
    }

    getResource(id: string, resource: string): Observable<Blob> {
        return this.http.get(`${this.api.getURL()}/student/${resource.toLocaleLowerCase()}/${id}`, { responseType: 'blob' });

    }

    getDriveDocuments(studentId: string): Observable<any> {
        return this.api.get(`student/get/documents/drive/${studentId}`).pipe(map(res => res.json()));
    }

    getFolderId(studentId: String): Observable<any> {
        return this.api.get(`student/get/folderid/${studentId}`).pipe(map(res => res.json()));
    }

    uploadDocumentDrive(id, data): Observable<any> {
        return this.api.put(`student/document/drive/${id}`, data).pipe(map(res => res.json())).pipe(
            tap(() => {
                this._refreshNeeded$.next();
            })
        );
    }

    getDriveFolderId(controlNumber: string, type: eFOLDER): Observable<any> {
        return this.api.get(`student/get/folderid/${controlNumber}/${type}`).pipe(map(res => res.json()));
    }

    getPeriodId(studentId: string): Observable<any> {
        return this.api.get(`student/get/periodinscription/${studentId}`).pipe(map(res => res.json()));
    }

    updateDocumentStatus(id, data): Observable<any> {
        return this.api.put(`student/document/status/${id}`, data).pipe(map(res => res.json())).pipe(
            tap(() => {
                this._refreshNeeded$.next();
            })
        );
    }

    getDocumentsUpload(_id: string): Observable<any> {
        return this.api.get(`student/get/documents/status/${_id}`).pipe(map(res => res.json()));
    }

    isStudentInscription(controlNumber: string): Observable<any> {
        return this.api.get(`student/get/inscription/ready/${controlNumber}`).pipe(map(res => res.json()));
    }

    getDocumentsInscription(controlNumber: string, degree: string): Observable<any> {
        return this.api.get(`student/inscription/docs/${controlNumber}/${degree}`).pipe(map(res => res.json()));
    }

    sendNotification(data) {
        return this.api.post(`student/notify`, data, true).pipe(map(res => res.json()));
    }

    getStatus(controlNumber: string): Observable<any> {
        return this.api.get(`student/get/status/sii/${controlNumber}`).pipe(map(res => res.json()));
    }

    createFromSii(controlNumber: string) {
        return this.api.post(`student/create/sii/${controlNumber}`, {}, true).pipe(map(res => res.json()));
    }

    studentsImssInsured() {
        return this.api.get(`imss/insured`).pipe(map(res => res.json()));
    }

    studentsImssUninsured() {
        return this.api.get(`imss/uninsured`).pipe(map(res => res.json()));
    }

    insuredStudent(controlNumber: string) {
        const doc = {
            registerDate: new Date(),
            type: 'IMSS'
        };
        return this.api.put(`imss/insured/${controlNumber}`, doc)
            .pipe(map(res => res.json()));
    }

    uninsuredStudent(controlNumber: string) {
        return this.api.delete(`imss/uninsured/${controlNumber}`)
            .pipe(map(res => res.json()));
    }

    insuredStudentsCsv(data: any) {
        return this.api.put(`imss/insured/csv`, data).pipe(map(res => res.json()));
    }

    regularizeNss() {
        return this.api.put('imss/regularize/nss', {}).pipe(map(res => res.json()));
    }

    convertCsv(data) {
        return this.api.post('imss/convert/csv', data).pipe(map(res => res.json()));
    }

    addCampaignStudent(controlNumber: string) {
        const doc = {
            registerDate: new Date(),
            type: 'CREDENCIAL'
        };
        return this.api.put(`student/campaign/${controlNumber}`, doc)
            .pipe(map(res => res.json()));
    }

    removeCampaignStudent(controlNumber: string) {
        return this.api.delete(`student/campaign/${controlNumber}`)
            .pipe(map(res => res.json()));
    }

    studentsCampaign() {
        return this.api.get(`student/campaign/students/all`).pipe(map(res => res.json()));
    }

    registerCredentialStudent(_id: string,status: boolean) {
        return this.api.put(`student/credential/${_id}`, {status})
            .pipe(map(res => res.json()));
    }
    insertSignedUpStudents() {
        return this.api.post('student/active/create', {}).pipe(map(res => res.json()));
    }

    getAllActiveStudents(): Observable<any> {
        return this.api.get(`student/get/active/students`).pipe(map(res => res.json()));
    }

    getStatusFromSii(controlNumber: string): Observable<any> {
        return this.api.get(`student/get/active/sii/${controlNumber}`).pipe(map(res => res.json()));
    }

    notificateDebtsStudents(students) {
        return this.api.post('student/inscriptions/register/debts/',{students}, true).pipe(map(res => res.json()));
    }

    registerExternalStudents(data) {
        return this.api.post('student/register/external', data).pipe(map(res => res.json()));
    }

}
