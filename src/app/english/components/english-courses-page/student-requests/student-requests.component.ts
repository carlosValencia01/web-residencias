import { Component, OnInit, Inject, ViewChild } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import { LoadingService } from 'src/app/services/app/loading.service';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';

import Swal from 'sweetalert2';

export interface DialogData {
  group: any
}

@Component({
  selector: 'app-student-requests',
  templateUrl: './student-requests.component.html',
  styleUrls: ['./student-requests.component.scss']
})
export class StudentRequestsComponent implements OnInit {

  dataSource: MatTableDataSource<any>;

  @ViewChild('matPaginatorEnglishStudents') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  englishStudents: any;
  creado = true;

  constructor(
    public dialogRef: MatDialogRef<StudentRequestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private loadingService: LoadingService) { }

  ngOnInit() {
    setTimeout(() => { 
      this.getDataSource();
    });
  }

  createDataSource(){
    this.dataSource = new MatTableDataSource(this.englishStudents);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  transformFormat(data, requestId, requestDate){
    return {
      _id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.studentId.controlNumber,
      career: data.studentId.career,
      email: data.studentId.email,
      currentPhone: data.currentPhone,
      requestId: requestId,
      requestDate: requestDate,
    };
  }

  getDataSource(){
    
    this.englishStudents = [];

    this.loadingService.setLoading(true);
    this.requestCourseProv.getAllRequestByCourse(this.data.group._id).subscribe(res => {

      console.log(res);
      res.requestCourses.forEach(element => {

        this.loadingService.setLoading(true);
        this.englishStudentProv.getEnglishStudentById(element.englishStudent).subscribe(res => {

          var englishStudent = JSON.parse(JSON.stringify(res.englishStudent[0]));
          this.englishStudents.push(this.transformFormat(englishStudent, element._id, element.requestDate));
          console.log(this.englishStudents);
          this.createDataSource();
  
        },error => {
  
          console.log(error);
  
        }, () => this.loadingService.setLoading(false));

      });

      this.createDataSource();

    },error => {

      console.log(error);

    }, () => this.loadingService.setLoading(false));
    

  }

  
  deleteStudentRequest(studentId, requestId, name){
    // Alert

    Swal.fire({
      title: 'Declinar estudiante',
      text: `Está por rechazar la solicitud del estudiante `+name+`. ¿Desea continuar?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {

        const data={
          status: 'rejected'
        };

        this.loadingService.setLoading(true);
        this.requestCourseProv.updateRequestById(requestId, data).subscribe(res => {

          console.log(res);

          const englishStudent = {
            $set: {status: 'rejected'}
          }
          this.englishStudentProv.updateEnglishStudent(englishStudent, studentId).subscribe(res2 => {
            console.log(res2);

            this.loadingService.setLoading(false);
            this.getDataSource();
            Swal.fire(
              'Eliminado!',
              'La solicitud del estudiante ha sido rechazada.',
              'success'
            );
   
          }, () => {
            this.loadingService.setLoading(false);
          });

        }, () => {
          this.loadingService.setLoading(false);
        });
        /*
        const data = {
          dayId: this.data.dayId,
          hourId: this.data.hourId,
          studentId: studentId
        }
        //Eliminar estudiante de la solicitud
        this.loadingService.setLoading(true);
        this.requestCourseProv.getAllRequestCourse().subscribe(res => {
          //Eliminar estudiante del arreglo
          if(res.nModified>0){
            for (var i =0; i < this.data.studentsId.length; i++){
              if (this.data.studentsId[i] === studentId) {
                this.data.studentsId.splice(i, 1);
              }
           }
           // Cambiar estatus del Estudiante
           const englishStudent = {
             $set: {status: 'Sin elección de Curso', 'notification.message': 'El curso en el horario solicitado no fue aperturado, seleccione otra opción', 'notification.show': true}
           }
           this.englishStudentProv.updateEnglishStudent(englishStudent, studentId).subscribe(res2 => {
            console.log(res2);
          });
          }
          this.loadingService.setLoading(false);
          this.getDataSource();
          Swal.fire(
            'Eliminado!',
            'La solicitud del estudiante ha sido rechazada.',
            'success'
          )
    
        }, () => {
          this.loadingService.setLoading(false);
        });

        */
      }
    });
    //
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
