import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';

@Injectable()
export class InscriptionsProvider {
    constructor(
        public api: Api,
    ) { }

    sendEmail(data: object) {
        return this.api.post('inscription/sendmail', data)
            .pipe(map(res => res.json()));
    }

    getAllPeriods(){
        return this.api.get('period').pipe(map( res=>res.json()));
    }

    createPeriod(data : object){
        return this.api.post('period/create',data).pipe(map( res=>res.json()));
    }

    updatePeriod(data : object, id : string){
        return this.api.put('period/update/'+id,data).pipe(map( res=>res.json()));
    }

    createFolder(folderName : string, period : string){
        return this.api.post(`drive/create/folder`,{folderName:folderName,period:period}).pipe(map( res=>res.json()));
    }
    createSubFolder(folderName : string, period : string, folderParentId : string){
        
        return this.api.post(`drive/create/subfolder`,{folderName:folderName,parentFolderId:folderParentId,period:period}).pipe(map( res=>res.json()));
    }
    uploadFile(data){
        return this.api.post('drive/upload/file/',data).pipe(map( res=>res.json()));
    }

    getAllFolders(){
        return this.api.get('drive/get/folders/all').pipe(map( res=>res.json()));
    }

    getFoldersByPeriod(period){
        return this.api.get('drive/get/folders/period/'+period).pipe(map( res=>res.json()));
    }
}
