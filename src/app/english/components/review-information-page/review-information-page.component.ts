import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import Swal from 'sweetalert2';
import { IEnglishStudent } from '../../entities/english-student.model';
import { EStatusEnglishStudentDB } from '../../enumerators/status-english-student.enum';
import { ReviewInformationModalComponent } from '../../modals/review-information-modal/review-information-modal.component';

@Component({
  selector: 'app-review-information-page',
  templateUrl: './review-information-page.component.html',
  styleUrls: ['./review-information-page.component.scss']
})
export class ReviewInformationPageComponent implements OnInit {
  @ViewChild('matPaginator') paginator: MatPaginator;
  @ViewChild('sortReviewInformation') sortReviewInformation: MatSort;
  dataSource: MatTableDataSource<any>;
  students: Array<any>;

  constructor(
    private studentEnglishProv: EnglishStudentProvider,
    public dialog: MatDialog,
  ) {

  }

  ngOnInit() {
    this.getStudents();
  }

  getStudents() {
    this.studentEnglishProv.getEnglishStudentNoVerified().subscribe(res => {
      this.students = res.englishStudent;
      this.dataSource = new MatTableDataSource(this.students.map((student, index) => this._parseStudentToTable(student, index)));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sortReviewInformation;
    });
  }

  _parseStudentToTable(student, index) {
    return {
      _id: student._id,
      student: student,
      no: index + 1,
      name: student.studentId.fullName,
      type: student.courseType.name,
      phone: student.currentPhone
    }
  }

  viewDetails(student) {
    const linkModal = this.dialog.open(ReviewInformationModalComponent, {
      data: {
        operation: 'view',
        student: student,
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90%',
      height: '80%'
    });
    let sub = linkModal.afterClosed().subscribe(
      information => {
        switch (information.action) {
          case 'accept':
            this.studentEnglishProv.updateEnglishStudent({ verified: true }, information.id).subscribe(res => {
              if (res) {
                Swal.fire({
                  title: 'Éxito!',
                  text: 'Información Verificada',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this.getStudents();
              }
            });
            break;
          case 'reject':
            const data = {
              verified: true,
              courseType: null,
              lastLevelInfo: null,
              level: 0,
              totalHoursCoursed: 0
            }
            this.studentEnglishProv.updateEnglishStudent(data, information.id).subscribe(res => {
              if (res) {
                Swal.fire({
                  title: 'Éxito!',
                  text: 'Información Rechazada',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this.getStudents();
              }
            });
            break;
          case 'update':
            const dataUpdate = {
              verified: true,
              status: information.data.level === information.data.course.totalSemesters
                ? EStatusEnglishStudentDB.NOT_RELEASED : EStatusEnglishStudentDB.NO_CHOICE,
              courseType: information.data.course._id,
              lastLevelInfo: {
                startHour: information.data.lastLevelInfo.startHour,
                endHour: information.data.lastLevelInfo.endHour,
                teacher: information.data.lastLevelInfo.teacher,
                period: information.data.lastLevelInfo.period
              },
              level: information.data.level,
              totalHoursCoursed: (information.data.course.semesterHours) * (information.data.level)
            }
            this.studentEnglishProv.updateEnglishStudent(dataUpdate, information.id).subscribe(res => {
              if (res) {
                Swal.fire({
                  title: 'Éxito!',
                  text: 'Información Actualizada y Validada',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this.getStudents();
              }
            });
            break;
        }
      },
      err => { }, () => sub.unsubscribe()
    );
  }

  acceptReq(studentId) {
    Swal.fire({
      title: 'Verificar Información',
      text: `¿Está seguro de verificar la información del curso previo del alumno?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.studentEnglishProv.updateEnglishStudent({ verified: true }, studentId).subscribe(res => {
          if (res) {
            Swal.fire({
              title: 'Éxito!',
              text: 'Información Verificada',
              showConfirmButton: false,
              timer: 2500,
              type: 'success'
            });
            this.getStudents();
          }
        });
      }
    });
  }


  declineReq(studentId) {
    Swal.fire({
      title: 'Rechazar Información',
      text: `¿Está seguro de rechazar la información del curso previo del alumno?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        const data = {
          verified: true,
          courseType: null,
          lastLevelInfo: null,
          level: 0,
          totalHoursCoursed: 0
        }
        this.studentEnglishProv.updateEnglishStudent(data, studentId).subscribe(res => {
          if (res) {
            Swal.fire({
              title: 'Éxito!',
              text: 'Información Rechazada',
              showConfirmButton: false,
              timer: 2500,
              type: 'success'
            });
            this.getStudents();
          }
        });
      }
    });
  }

}
