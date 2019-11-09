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

    getActivePeriod(){
        return this.api.get('period/active').pipe(map( res=>res.json()));
    }

    createPeriod(data : object){
        return this.api.post('period/create',data).pipe(map( res=>res.json()));
    }

    updatePeriod(data : object, id : string){
        return this.api.put('period/update/'+id,data).pipe(map( res=>res.json()));
    }

    updateStudent(data : object, id : string){
        return this.api.put('inscription/updateStudent/'+id,data).pipe(map( res=>res.json()));
    }

    getStudent(id : string){
        return this.api.get('inscription/getStudent/'+id).pipe(map( res=>res.json()));
    }

    getStudents(){
        return this.api.get('inscription/getStudents/').pipe(map( res=>res.json()));
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

    getFile(fileId,fileName){
        return this.api.post('drive/get/file',{fileId:fileId,fileName:fileName}).pipe(map( 
            res=>res.json()
            ));
    }

    uploadFile2(data){
        return this.api.post('drive/upload/file2/',data).pipe(map( res=>res.json()));
    }
}
