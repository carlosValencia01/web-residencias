import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor( private db: AngularFirestore ) {}

  // Registrar un correo
  public newEmail(data: {correo: string} , collection: string) {
    return this.db.collection(collection).add(data);
  }

  // Obtener un alumno
  public getGraduate(documentId: string , collection: string) {
    return this.db.collection(collection).doc(documentId).snapshotChanges();
  }

  // Obtiene todos los alumnos
  public getGraduates(collection: string) {
    return this.db.collection(collection).snapshotChanges();
  }

  // Actualiza un alumno
  public updateGraduate(documentId: string, data: any , collection: string) {
    return this.db.collection(collection).doc(documentId).set(data);
  }

  updateFieldGraduate(documentId: string, data: any , collection: string) {
    return this.db.collection(collection).doc(documentId).update(data);
  }

  // carga csv
  public loadCSV(data , collection: string) {
    return this.db.collection(collection).add(data);
  }

  // crear evento
  public createEvent(name: string, status: number) {
    return this.db.collection('eventosG').doc(name).set({estatus: status});
  }

  // obtiene evento activo === estatus = 1
  // espera === estatus = 2
  // inactivo === estatus = 3
  public getActivedEvent() {
    return this.db.collection('eventosG', ref => ref.where('estatus', '==', 1)).snapshotChanges();
  }
  public getEvent(event: string) {
    return this.db.collection('eventosG').doc(event).snapshotChanges();
  }

  // obtiene todos los eventos
  public getAllEvents() {
    return this.db.collection('eventosG', ref => ref.orderBy('estatus', 'asc')).snapshotChanges();
  }

  // cambiar estatus de evento
  public setStatusEvent(status: number, idEvent) {
    return this.db.collection('eventosG').doc(idEvent).update({estatus: status});
  }

  // crear perfil Alumno
  public createProfile(idProfile: string, data: any) {
    return this.db.collection('perfilAlumno').doc(idProfile).set(data);
  }

  public createProfileNew(data: any) {
    return this.db.collection('perfilAlumno').add(data);
  }

  // obtener perfil Alumno
  public getProfile(idProfile: string) {
    return this.db.collection('perfilAlumno').doc(idProfile).snapshotChanges();
  }

  // obtener todos los perfiles Alumno
  public getProfiles() {
    return this.db.collection('perfilAlumno').snapshotChanges();
  }

  // obtener preguntas Encuestra
  public getQuestionsSurvey() {
    return this.db.collection('preguntasEncuesta').snapshotChanges();
  }

  // guardar respuestas Encuesta
  public saveAnswersQuestions(idStudent: string, data: any, event) {
    return this.db.collection(event).doc(idStudent).update({respuestas: data, survey: true});
  }

  // guardar respuestas Encuesta
  public saveProfileAnswersQuestions(idProfile: string, data: any) {
    return this.db.collection('perfilAlumno').doc(idProfile).update({respuestas: data, survey: true, fechaEncuesta: new Date()});
  }

  // cambiar status Survey en evento principal
  public updateStatusSurvey(idStudent: string, event) {
    return this.db.collection(event).doc(idStudent).update({survey: true});
  }

  // crear pregunta
  public setQuestion(idQuestion, description) {
    return this.db.collection('preguntasEncuesta').doc(idQuestion).set({descripcion: description});
  }

  // Obtener las encuesta
  public getSurvey() {
    return this.db.collection('perfilAlumno').snapshotChanges();
  }
}
