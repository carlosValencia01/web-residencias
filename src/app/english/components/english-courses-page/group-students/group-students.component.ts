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

    this.englishStudents = [];

    this.loadingService.setLoading(true);
    this.requestCourseProv.getAllRequestStudyingByCourse(this.data.group._id).subscribe(res => {

      res.requestCourses.forEach(element => {

        this.loadingService.setLoading(true);
        this.englishStudentProv.getEnglishStudentById(element.englishStudent).subscribe(res => {

          var englishStudent = JSON.parse(JSON.stringify(res.englishStudent[0]));
          this.englishStudents.push(this.transformFormat(englishStudent, element._id, element.requestDate));
          this.englishStudents.sort((a, b) => a._id.localeCompare(b._id));

          this.createDataSource();

        }, error => {

        }, () => this.loadingService.setLoading(false));

      });

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
