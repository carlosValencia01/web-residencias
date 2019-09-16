import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from './api.prov';

@Injectable()
export class RequestProvider {
    constructor(public api: Api) {}

    getAllRequest() {
        return this.api.get('request')
            .pipe(map(requests => requests.json()));
    }
    getAllRequests() {
        return this.api.get(`graduate/request/all`)
          .pipe(map(request => request.json()));
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

    saveRequest(data: any) {
        return this.api.post('graduate/request', data)
          .pipe(map(request => request.json()));
      }
    
      editRequest(data: any, _id: any) {
        return this.api.put(`graduate/request/${_id}`, data)
          .pipe(map(request => request.json()));
      }
    
      updateRequestStatus(data: any, _id: any) {
        return this.api.put(`graduate/request/status/${_id}`, data)
          .pipe(map(request => request.json()));
      }
      getRequestByControlNumber(controlNumber: any) {
        return this.api.get(`graduate/request/${controlNumber}`)
          .pipe(map(request => request.json()));
      }
}
