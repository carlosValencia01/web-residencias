import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, CollectionReference, AngularFirestoreCollection } from 'angularfire2/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  

  constructor(
    private firestore : AngularFirestore
  ) {       
  }
  
  //Registrar un correo
  public newEmail(data: {correo: string} , collection : string) {
    return this.firestore.collection(collection).add(data);
  }

  //Obtener un alumno
  public getGraduate(documentId: string , collection : string) {
    return this.firestore.collection(collection).doc(documentId).snapshotChanges();
  }

  //Obtiene todos los alumnos
  public getGraduates(collection : string) {
    return this.firestore.collection(collection).snapshotChanges();
  }

  //Actualiza un alumno
  public updateGraduate(documentId: string, data: any , collection : string) {
    return this.firestore.collection(collection).doc(documentId).set(data);
  }

  //carga csv

  public loadCSV(data , collection : string){    
    return this.firestore.collection(collection).add(data);
  }

  //crear evento
  public createEvent(name : string, status : number){
    return this.firestore.collection("eventosG").doc(name).set({estatus:status});
  }

  //obtiene evento activo === estatus = 1
  //inactivo === estatus = 0
  public getActivedEvent(){
    return this.firestore.collection("eventosG", ref=>ref.where("estatus","==",1)).snapshotChanges();
  }

  //obtiene todos los eventos
  public getAllEvents(){
    return this.firestore.collection("eventosG", ref=>ref.orderBy("estatus","desc")).snapshotChanges();
  }

  //cambiar estatus de evento
  public setStatusEvent(status : number, idEvent){
    return this.firestore.collection("eventosG").doc(idEvent).update({estatus:status});
  }

}
