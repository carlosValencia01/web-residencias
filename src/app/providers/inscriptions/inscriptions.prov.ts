import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';

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

    getStudentsLogged(){
        return this.api.get('inscription/getStudentsLogged/').pipe(map( res=>res.json()));
    }

    getStudentsProcess(){
        return this.api.get('inscription/getStudentsProcess/').pipe(map( res=>res.json()));
    }

    getStudentsPendant(){
        return this.api.get('inscription/getStudentsPendant/').pipe(map( res=>res.json()));
    }

    getStudentsAcept(){
        return this.api.get('inscription/getStudentsAcept/').pipe(map( res=>res.json()));
    }

    createFolder(folderName : string, period : string, type: number){
        return this.api.post(`drive/create/folder`,{folderName:folderName,period:period,type:type}).pipe(map( res=>res.json()));
    }

    createSubFolder(folderName : string, period : string, folderParentId : string, type : number){
        
        return this.api.post(`drive/create/subfolder`,{folderName:folderName,parentFolderId:folderParentId,period:period,type:type}).pipe(map( res=>res.json()));
    }
    
    uploadFile(data){
        return this.api.post('drive/upload/file/',data).pipe(map( res=>res.json()));
    }

    getAllFolders(){
        return this.api.get('drive/get/folders/all').pipe(map( res=>res.json()));
    }

    getFoldersByPeriod(period,type){
        return this.api.get(`drive/get/folders/period/${period}/${type}`).pipe(map( res=>res.json()));
    }

    getFile(fileId,fileName){
        return this.api.post('drive/get/file',{fileId:fileId,fileName:fileName}).pipe(map( 
            res=>res.json()
            ));
    }

    uploadFile2(data){
        return this.api.post('drive/upload/file2/',data).pipe(map( res=>res.json()));
    }

    sendNotification(email: string, titulo: string, nombre: string, mensaje: string, asunto: string, remitente: string) {
        return this.api.post('inscription/notificationMail', { to_email: [email], title: titulo, name: nombre, message: mensaje, subject: asunto, sender: remitente })
        .pipe(map(data => data.json()));
    }

    getIntegratedExpedient(){
        return this.api.get('inscription/getIntegratedExpedient/').pipe(map( res=>res.json()));
    }

    getArchivedExpedient(){
        return this.api.get('inscription/getArchivedExpedient/').pipe(map( res=>res.json()));
    }
    
    getNumberInscriptionStudentsByPeriod(){
        return this.api.get('inscription/getNumberInscriptionStudentsByPeriod').pipe(map( res=>res.json()));
    }

    sendNotificationMail(data){
        return this.api.post('inscription/sendnotificationmail',data).pipe(map(res => res.json()));
    }
}
