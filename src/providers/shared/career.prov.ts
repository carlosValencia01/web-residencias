import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';


@Injectable()
export class CareerProvider {
    constructor(
        public api: Api        
    ) {

    }

    getAllCareers() {
        return this.api.get('career')
            .pipe(map(careers => careers.json()));
    }

    getCareerById(_id) {
        return this.api.get(`career/career/${_id}`)
            .pipe(map(career => career.json()));
    }

    updateCareer(id, data) {
        return this.api.put(`career/update/${id}`, data)
            .pipe(map(career => career.json()));
    }
    
    newCareer(data) {
        return this.api.post(`career/create`, data)
            .pipe(map(career => career.json()));
    }
}
