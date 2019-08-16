import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, CollectionReference, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private register: AngularFirestoreCollection;

  constructor(
    private firestore : AngularFirestore
  ) { 
    this.register = firestore.collection('registrograduacion')
  }
  
  //Registrar un correo
  public newEmail(data: {correo: string}) {
    return this.register.add(data);
  }

  //Obtener un alumno
  public getGraduate(documentId: string) {
    return this.register.doc(documentId).snapshotChanges();
  }

  //Obtiene todos los alumnos
  public getGraduates() {
    return this.register.snapshotChanges();
  }

  //Actualiza un alumno
  public updateGraduate(documentId: string, data: any) {
    return this.register.doc(documentId).set(data);
  }

  //carga csv

  public loadCSV(data){
    return this.register.add(data);
  }
}
