import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class EnglishPeriodProvider {

    constructor(private api: Api) { }

    getAllEnglishPeriod() {
        return this.api.get('sg-cle/englishperiod/all')
            .pipe(map(englishPeriod => englishPeriod.json()));
    }

    createEnglishPeriod(englishPeriod) {
        return this.api.post('sg-cle/englishperiod/create', englishPeriod)
            .pipe(map(created => created.json()));
    }

    updateEnglishPeriod(_id, englishPeriod) {
        return this.api.put('sg-cle/englishperiod/update/' + _id, englishPeriod)
            .pipe(map(updated => updated.json()));
    }

    inEnglishPeriod(_option) {
        return this.api.get('sg-cle/englishperiod/in/' + _option)
            .pipe(map(res => res.json()));
    }
    getActivePeriod(){
        return this.api.get('period/active').pipe(map( res=>res.json()));
    }
}
