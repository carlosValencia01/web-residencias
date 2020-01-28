import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
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
  public createEvent(name: string, data) {
    return this.db.collection('eventosG').doc(name).set(data);
  }

  // actualza evento
  public updateEvent(name: string, data) {
    return this.db.collection('eventosG').doc(name).set(data);
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

  // obtiene carrera con posicion menor
  public getCareerActive() {
    return this.db.collection('carreras', ref => ref.orderBy('posicion')).snapshotChanges().pipe(
      map( carreras => {if (carreras.length > 0) { return carreras[0].payload.doc.data(); } else { return null; }})
    );
  }

  // activar carrera actual
  public setActiveCareer(): void {
    let sub = this.getCareerActive().subscribe(
      (res: any) => {
        sub.unsubscribe();
        this.db.collection('carreras').doc(res.nombre).update({activo: true});
      }
    );
  }

  // todas las carreras
  public getCareers() {
    return this.db.collection('carreras', ref => ref.orderBy('posicion')).snapshotChanges().pipe(
      map( carreras => carreras.map(carrera => carrera.payload.doc.data()))
    );
  }

  // cambia los estatus de las carreras
  public resetActiveCareer(): void {
    let sub1 = this.getCareers().subscribe(
      (careers) => {
        sub1.unsubscribe();
        careers.forEach(async (career: any) => {
          await this.db.collection('carreras').doc(career.nombre).update({activo: false, mencionada: false}).then( res => res);
        });
        this.setActiveCareer();
      },
      err => {sub1.unsubscribe(); }
    );
  }

  // obtiene los mejores promedios
  public getBestAverages( collection: string) {
    return this.db.collection(collection).snapshotChanges()
      .pipe( map( (alumno ) => alumno.map( alumno => {return {_id: alumno.payload.doc.id, data: alumno.payload.doc.data()}; }))).pipe( map(
      alumno => alumno.filter( (al: any) => al.data.mejorPromedio === true
    )));
  }
  public asignEvent(collection, nc)  {
    return this.db.collection('alumnoPeriodo').add({collection,nc});
  }

  // obtiene el registro del dispositivo del alumno
  public getStudentToken( nc: string) {
    return this.db.collection('alumnoDispositivo', ref=> ref.where('nc','==',nc+'')).snapshotChanges()
      .pipe( map( (alumno ) => alumno.map( alumno => {return {id: alumno.payload.doc.id, token: alumno.payload.doc.get('token'),pendientes:alumno.payload.doc.get('pendientes')}; })));
  }

  public sendNotification( id: string, data){        
    return this.db.collection('alumnoDispositivo').doc(id).update({
      notificaciones: firebase.firestore.FieldValue.arrayUnion(data)          
    });    
  }

  public createDeviceToken(nc: string){
    return this.db.collection('alumnoDispositivo').add({token:[],nc,notificaciones:[],pendientes:0});
  }

  public updateDeviceStudent( id: string, data){
    return this.db.collection('alumnoDispositivo').doc(id).update(data);
  }
}
