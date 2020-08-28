import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// SERVICIOS
import { LoadingService } from 'src/app/services/app/loading.service';

// PROVEEDORES
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';

// MODELOS
import { IGroup } from '../../../entities/group.model';
import { IEnglishStudent } from '../../../entities/english-student.model';

export interface DialogData {
  group: IGroup
}

@Component({
  selector: 'app-group-students',
  templateUrl: './group-students.component.html',
  styleUrls: ['./group-students.component.scss']
})
export class GroupStudentsComponent implements OnInit {

  dataSource: MatTableDataSource<any>;

  @ViewChild('matPaginatorEnglishStudents') paginatorStudents: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sortStudents') sortStudents: MatSort;

  englishStudents: any;
  showButtonAdd = false;
  showButtonDrop = false;
  searchStudent = '';

  constructor(
    public dialogRef: MatDialogRef<GroupStudentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private loadingService: LoadingService) { }

  ngOnInit() {
    setTimeout(() => {
      this.getDataSource();
    });
  }

  getDataSource() {

    this.loadingService.setLoading(true);

    this.requestCourseProv.getAllRequestActiveCourse(this.data.group._id).subscribe(async res => { 
      this.englishStudents = res.requestCourses;
      this.createDataSource();
    }, error => {

    }, () => this.loadingService.setLoading(false));

  }

  transformFormat(data, requestId, requestDate) {
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

  createDataSource() {
    this.dataSource = new MatTableDataSource(this.englishStudents);
    this.dataSource.paginator = this.paginatorStudents;
    this.dataSource.sort = this.sortStudents;

    this.validateButtons();
  }

  validateButtons() {
    if (this.englishStudents.length > this.data.group.minCapacity) {
      this.showButtonDrop = true;
    } else {
      this.showButtonDrop = false;
    }
    if (this.englishStudents.length < this.data.group.maxCapacity) {
      this.showButtonAdd = true;
    } else {
      this.showButtonAdd = false;
    }
  }

  setupFilter() {
    this.dataSource.filterPredicate = (data, filterValue: string) =>  
      data.englishStudent.studentId.fullName.trim().toLowerCase().indexOf(filterValue) !== -1 ||
      data.englishStudent.studentId.controlNumber.indexOf(filterValue) !== -1 ||
      (data.englishStudent.studentId.careerId ? data.englishStudent.studentId.careerId.shortName.trim().toLowerCase().indexOf(filterValue) !== -1 : false) ||
      data.englishStudent.studentId.email.trim().toLowerCase().indexOf(filterValue) !== -1 ||
      data.englishStudent.currentPhone.indexOf(filterValue) !== -1
  }

  applyFilter() {
    this.dataSource.filter = this.searchStudent.trim().toLowerCase();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  declineStudentRequest(student){
    Swal.fire({
      title: 'Declinar estudiante',
      text: `Está por rechazar la solicitud del estudiante ` + student.englishStudent.studentId.fullName + `. ¿Desea continuar?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        this.requestCourseProv.declineRequest(student).subscribe(updated => {
          if (updated) {
            Swal.fire({
              title: 'Alumno declinado con exito!',
              showConfirmButton: false,
              timer: 2500,
              type: 'success'
            });
            this.getDataSource();
          }
        });
        this.loadingService.setLoading(false);
      }
    });
  }

  deleteStudentRequest(studentId, requestId, name) {
    // Alert

    Swal.fire({
      title: 'Declinar estudiante',
      text: `Está por rechazar la solicitud del estudiante ` + name + `. ¿Desea continuar?`,
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

        const data = {
          status: 'rejected'
        };

        this.loadingService.setLoading(true);
        this.requestCourseProv.updateRequestById(requestId, data).subscribe(res => {

          const englishStudent = {
            $set: { status: 'rejected' }
          }
          this.englishStudentProv.updateEnglishStudent(englishStudent, studentId).subscribe(res2 => {

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
      }
    });
  }

}
