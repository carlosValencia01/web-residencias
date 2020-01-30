import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RequestProvider {
    constructor(
        public api: Api,
        private http: HttpClient,
    ) { }

    getApiURL() {
        return this.api.getURL();
    }

    titled(data) {
        return this.api.post(`request/titled`, data).pipe(map(res => res.json()));
    }

    removeTitle(_id) {
        return this.api.delete(`request/${_id}`).pipe(map(res => res.json()));
    }

    getAllRequestByStatus(role) {
        return this.api.get(`request/phase/${role}`)
            .pipe(map(requests => requests.json()));
    }

    getRequestById(_id) {
        return this.api.get(`request/${_id}`)
            .pipe(map(request => request.json()));
    }

    updateRequest(_id, data) {
        return this.api.put(`request/${_id}/status`, data).pipe(map(request => request.json()));
    }

    releasedRequest(_id, data) {
        // return this.api.put(`request/${_id}/released`, data, true).pipe(map(request => request.json()));
        return this.api.put(`request/${_id}/released`, data).pipe(map(request => request.json()));
    }

    uploadFile(_id, data) {
        return this.api.post(`request/${_id}/file`, data, true).pipe(map(request => request.json()));
    }

    omitFile(_id, data) {
        return this.api.post(`request/${_id}/file/omit`, data).pipe(map(request => request.json()));
    }

    // getResource(id: string, resource: string): Observable<Blob> {
    //     return this.http.get(`${this.api.getURL()}/request/${id}/file/${resource.toLocaleLowerCase()}`, { responseType: 'blob' });
    // }
    getResource(id: string, resource: string): Observable<Blob> {
        return this.http.get(`${this.api.getURL()}/request/${id}/file/${resource.toLocaleLowerCase()}`, { responseType: 'blob' });
    }

    updateFileStatus(_id, data) {
        return this.api.put(`request/${_id}/file`, data).pipe(map(request => request.json()));
    }

    getAvailableSpaces(data) {
        return this.api.post(`request/schedule`, data).pipe(map(request => request.json()));
    }

    getDiary(data) {
        return this.api.post(`request/diary`, data).pipe(map(request => request.json()));
    }

    StudentsToSchedule() {
        return this.api.get(`request/students`).pipe(map(request => request.json()));
    }

    verifyCode(requestId, code) {
        return this.api.get(`request/verify/${requestId}/${code}`)
            .pipe(map(res => res.json()));
    }

    sendVerificationCode(_requestId) {
        return this.api.get(`request/sendCode/${_requestId}`)
            .pipe(map(res => res.json()));
    }
}
