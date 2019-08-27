import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  

  constructor( private db : AngularFirestore ) {}
  
  //Registrar un correo
  public newEmail(data: {correo: string} , collection : string) {
    return this.db.collection(collection).add(data);
  }

  //Obtener un alumno
  public getGraduate(documentId: string , collection : string) {
    return this.db.collection(collection).doc(documentId).snapshotChanges();
  }

  //Obtiene todos los alumnos
  public getGraduates(collection : string) {
    return this.db.collection(collection).snapshotChanges();
  }

  //Actualiza un alumno
  public updateGraduate(documentId: string, data: any , collection : string) {
    return this.db.collection(collection).doc(documentId).set(data);
  }

  //carga csv

  public loadCSV(data , collection : string){    
    return this.db.collection(collection).add(data);
  }

  //crear evento
  public createEvent(name : string, status : number){
    return this.db.collection("eventosG").doc(name).set({estatus:status});
  }

  //obtiene evento activo === estatus = 1
  //espera === estatus = 2
  //inactivo === estatus = 3
  public getActivedEvent(){
    return this.db.collection("eventosG", ref=>ref.where("estatus","==",1)).snapshotChanges();
  }
  public getEvent(event : string){
    return this.db.collection("eventosG").doc(event).snapshotChanges();
  }

  //obtiene todos los eventos
  public getAllEvents(){
    return this.db.collection("eventosG", ref=>ref.orderBy("estatus","asc")).snapshotChanges();
  }

  //cambiar estatus de evento
  public setStatusEvent(status : number, idEvent){
    return this.db.collection("eventosG").doc(idEvent).update({estatus:status});
  }

}
