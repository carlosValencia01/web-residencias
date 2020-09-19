import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import { CookiesService } from 'src/app/services/app/cookie.service';

import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import { Subscription } from 'rxjs';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CareerProvider } from 'src/app/providers/shared/career.prov';
import { ICareer } from 'src/app/entities/app/career.model';
@Component({
  selector: 'app-certificate-line',
  templateUrl: './certificate-ine.component.html',
  styleUrls: ['./certificate-ine.component.scss']
})
export class CertificateIneComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['nc', 'name', 'career','actions'];
  dataSource: MatTableDataSource<any>;
  
  @ViewChild(MatSort) set sort(sort: MatSort){
    this.dataSource.sort = sort;
    this.dataSource.sort = sort;  
  };
  @ViewChild('paginator') set paginator(paginator: MatPaginator){    
    this.dataSource.paginator = paginator;
  };
  // Variable donde se almacenan todos los alumnos
  public students = [];
  subs: Array<Subscription> = [];
  @Input('collection') collection: string;
  filters = { //variable para controlar los filtros que estan activos del evento
    career:{
      status:false,
      value:''
    },    
    textSearch:{
      status:false,
      value:''
    }
  };
  role: string;
  careers: Array<ICareer>;
  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private studentProv: StudentProvider,
    private careerProv: CareerProvider
  ) { 
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    const rol = this.cookiesService.getData().user.role;
    this._transformRole(rol);
    this.getCareers();
    this.subs.push( this.firestoreService.getGraduates(this.collection).subscribe((alumnosSnapshot) => { 
      this.students = alumnosSnapshot.reduce((prev, alumno) => {
        if(alumno.payload.doc.get('documentationStatus') &&  alumno.payload.doc.get('documentationStatus').toLowerCase() == 'solicitado'){
          prev.push({
            id: alumno.payload.doc.id,
            nc: alumno.payload.doc.get('nc'),
            name: alumno.payload.doc.get('nombre'),
            nameLastName: alumno.payload.doc.get('nombreApellidos'),
            carreer: alumno.payload.doc.get('carrera'),
            carreerComplete: alumno.payload.doc.get('carreraCompleta'),
            email: alumno.payload.doc.get('correo'),
            status: alumno.payload.doc.get('estatus'),
            degree: alumno.payload.doc.get('degree') ? true : false,
            observations: alumno.payload.doc.get('observations'),
            survey: alumno.payload.doc.get('survey'),
            genero: alumno.payload.doc.get('genero'),
            curp: alumno.payload.doc.get('curp'),
            bestAverage: alumno.payload.doc.get('mejorPromedio') ? alumno.payload.doc.get('mejorPromedio') : false,
            average: alumno.payload.doc.get('promedio') ? alumno.payload.doc.get('promedio') : 0,
            documentationStatus: alumno.payload.doc.get('documentationStatus') ? alumno.payload.doc.get('documentationStatus') : ' ',
            specialty: alumno.payload.doc.get('especialidad') ? alumno.payload.doc.get('especialidad') : '<<Especialidad>>',
            numInvitados: alumno.payload.doc.get('numInvitados') ? alumno.payload.doc.get('numInvitados') : 0,
            invitados: alumno.payload.doc.get('invitados') ? alumno.payload.doc.get('invitados') : [{}],
            nss: alumno.payload.doc.get('nss') ? alumno.payload.doc.get('nss') : ''
  
          })       
        }
        return prev;
      },[]);
      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.nameLastName.localeCompare(b.nameLastName);
      });

      this.dataSource = new MatTableDataSource(this.students);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort; 
      this.applyFilters();
    }));
  }

  ngOnDestroy(){
    this.subs.forEach( sub => {
      if(!sub.closed) sub.unsubscribe();
    });
  }

  _transformRole(role: number){
    switch (role) {
      case 0:
        this.role = 'administration';
        break;
      case 1:
        this.role = 'secretary';
        break;
      case 2:
        this.role = 'student';
        break;
      case 3:
        this.role = 'employee';
        break;
      case 4:
        this.role = 'rechumanos';
        break;
      case 5:
        this.role = 'comunication';
        break;
      case 6:
        this.role = 'coordinator';
        break;
      case 9:
        this.role = 'recfinancieros';
        break;
      case 20:
        this.role = 'asistenciaInvitados';
        break;
    }
  }

  filter(type: string, event: Event){ //funcion para controlar los filtros activos
    const filterValue: string = (event.target as HTMLInputElement).value.trim().toLowerCase();  
    
    switch(type){
      case 'career':{ //filtrar por carrera
        if(filterValue == 'default'){          
          this.filters.career.status = false;
          this.filters.career.value = '';
          
        }else{
          this.filters.career.status = true;
          this.filters.career.value = filterValue;  
       
        }        
        break;
      }    
      
      case 'search':{ //para el cuadro de texto
        if(filterValue !== ''){
          this.filters.textSearch.status = true;
          this.filters.textSearch.value = filterValue;
        }else{
          this.filters.textSearch.status = false;
          this.filters.textSearch.value = '';
        }        
        break;
      }
      
    }
    this.applyFilters();
    
  }

  applyFilters(){ //funcion para aplicar filtros activos
    this.dataSource.data = this.students.slice(0);
    
    if(this.filters.career.status){
      this.dataSource.data = this.dataSource.data.filter(st=>st.carreer.toLowerCase() == this.filters.career.value);
    }
    if(this.filters.textSearch.status){
      this.dataSource.filter = this.filters.textSearch.value;
    }
  }

  changeStatusDocumentation(student, status) {
    switch (status) {
      case 'LINEA ASIGNADA':
        this.firestoreService.updateFieldGraduate(student.id, {documentationStatus: status}, this.collection);
        this.sendNotification('Línea asignada', 'Ya puedes imprimir tu recibo de pago para el certificado', student.nc);
        break;
      
    }    
  }

  sendNotification(title: string, body: string, nc: string) {
    const subTok = this.firestoreService.getStudentToken(nc).subscribe(
      (token) => {
        subTok.unsubscribe();
        const infoToken = token[0];
        const notification = {
          'titulo': title,
          'descripcion': body,
          'fecha': new Date()
        };
        if (infoToken) {
          // student device exist
          if (infoToken.token) {
            // student has token device
            // send notification
            this.firestoreService.sendNotification(infoToken.id, notification).then(
              _ => {
                this.studentProv.sendNotification({title, body, token: infoToken.token, screen: 'graduation'}).subscribe(
                  __ => {
                    this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Graduación', 'Notificación enviada');
                  }
                );
              }
            );
          } else {
            // only save notification in firebase
            this.firestoreService
              .sendNotification(infoToken.id, notification)
              .then(_ => console.log('Enviado'));
          }
          this.firestoreService
            .updateDeviceStudent(infoToken.id, {pendientes: (infoToken.pendientes + 1)})
            .then(_ => {});
        } else {
          // create register for notifications
          // only save notification in firebase
          this.firestoreService.createDeviceToken(nc).then(
            (created) => {
              const subST = this.firestoreService.getStudentToken(nc).subscribe(
                _ => {
                  subST.unsubscribe();
                  this.firestoreService.sendNotification(infoToken.id, notification).then(
                    __ => {
                      console.log('Enviado');
                      this.firestoreService
                        .updateDeviceStudent(infoToken.id, {pendientes: (infoToken.pendientes + 1)})
                        .then(___ => {});
                    }
                  );
                }
              );
            }
          );
        }
      }
    );
  }

  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      (res)=>{       
        
        this.careers = res.careers;        
      },
      err=>console.warn(err)
      
    );
  }

}
