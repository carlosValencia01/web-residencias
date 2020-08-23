import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
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
import { GroupProvider } from 'src/app/english/providers/group.prov';

// MODELOS
import { IGroup } from '../../../entities/group.model';

export interface DialogData {
  group: IGroup
}

@Component({
  selector: 'app-student-requests',
  templateUrl: './student-requests.component.html',
  styleUrls: ['./student-requests.component.scss']
})
export class StudentRequestsComponent implements OnInit {

  dataSource: MatTableDataSource<any>;

  @ViewChild('matPaginatorEnglishStudents') paginatorStudents: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sortStudents') sortStudents: MatSort;

  englishStudents: any;
  showCreateGroup = false;

  //

  selectedEnglishStudents: any;
  englishStudentsWaiting: any;
  dataSourceSelected: MatTableDataSource<any>;
  dataSourceWaiting: MatTableDataSource<any>;
  showButtonAdd = false;
  showButtonDrop = false;
  selectedTab: FormControl;
  @ViewChild('matPaginatorEnglishStudentsSelected') paginatorSelectedStudents: MatPaginator;
  @ViewChild('matPaginatorEnglishStudentsWaiting') paginatorStudentsWaiting: MatPaginator;
  @ViewChild('sortStudentsSelected') sortSelectedStudents: MatSort;
  @ViewChild('sortStudentsWaiting') sortStudentsWaiting: MatSort;

  constructor(
    public dialogRef: MatDialogRef<StudentRequestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private groupProv: GroupProvider,
    private loadingService: LoadingService,
  ) {
    this.selectedTab = new FormControl(0);
  }

  ngOnInit() {
    setTimeout(() => {
      this.getDataSource();
    });
  }

  createDataSource() {
    this.dataSource = new MatTableDataSource(this.englishStudents);
    this.dataSource.paginator = this.paginatorStudents;
    this.dataSource.sort = this.sortStudents;
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

  getDataSource() {

    this.englishStudents = [];

    this.loadingService.setLoading(true);
    this.requestCourseProv.getAllRequestByCourse(this.data.group._id).subscribe(res => {


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


  deleteStudentRequest(studentId, requestId, name) {
    // Alert
    Swal.fire({
      title: `Está por rechazar la solicitud del estudiante ` + name + `. ¿Desea continuar?`,
      type: 'warning',
      html:
        '<textarea rows="4" cols="30" id="observaciones" placeholder="Ingrese el motivo del rechazo"></textarea>  ',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        const observations = (<HTMLInputElement>document.getElementById('observaciones')).value;

        const data = {
          status: 'rejected',
          rejectMessage: observations
        };

        this.loadingService.setLoading(true);
        this.requestCourseProv.updateRequestById(requestId, data).subscribe(res => {

          const englishStudent = {
            $set: {
              status: 'rejected',
              rejectMessage: observations
            }
          }
          this.englishStudentProv.updateEnglishStudent(englishStudent, studentId).subscribe(res2 => {

            this.loadingService.setLoading(false);
            this.getDataSource();
            Swal.fire(
              'Solicitud Rechazada',
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

  prepareGroup() {
    this.selectedEnglishStudents = this.englishStudents.slice(0, this.data.group.maxCapacity);
    this.englishStudentsWaiting = this.englishStudents.slice(this.data.group.maxCapacity);

    this.showCreateGroup = true;

    setTimeout(() => {
      this.createDataSourceSelectedAndWaiting();
    });

  }

  createDataSourceSelectedAndWaiting() {
    this.dataSourceSelected = new MatTableDataSource(this.selectedEnglishStudents);
    this.dataSourceSelected.paginator = this.paginatorSelectedStudents;
    this.dataSourceSelected.sort = this.sortSelectedStudents;

    this.dataSourceWaiting = new MatTableDataSource(this.englishStudentsWaiting);
    this.dataSourceWaiting.paginator = this.paginatorStudentsWaiting;
    this.dataSourceWaiting.sort = this.sortStudentsWaiting;

    this.validateButtons();

  }


  validateButtons() {
    if (this.selectedEnglishStudents.length > this.data.group.minCapacity) {
      this.showButtonDrop = true;
    } else {
      this.showButtonDrop = false;
    }
    if (this.selectedEnglishStudents.length < this.data.group.maxCapacity) {
      this.showButtonAdd = true;
    } else {
      this.showButtonAdd = false;
    }
  }

  changeStudent(student, move) {

    let originArray = [];
    let destinationArray = [];

    switch (move) {
      case 0:
        originArray = this.selectedEnglishStudents;
        destinationArray = this.englishStudentsWaiting;
        break;
      case 1:
        originArray = this.englishStudentsWaiting;
        destinationArray = this.selectedEnglishStudents;
        break;
    }

    originArray.splice(originArray.indexOf(student), 1);
    destinationArray.push(student);
    destinationArray.sort((a, b) => a._id.localeCompare(b._id));

    switch (move) {
      case 0:
        this.selectedEnglishStudents = originArray;
        this.englishStudentsWaiting = destinationArray;
        break;
      case 1:
        this.englishStudentsWaiting = originArray;
        this.selectedEnglishStudents = destinationArray;
        break;
    }

    this.createDataSourceSelectedAndWaiting();
  }

  cancelGroup() {
    this.showCreateGroup = false;
    setTimeout(() => {
      this.getDataSource();
    });
  }

  saveGroup() {
    let dataGroup = {
      name: this.data.group.name,
      schedule: this.data.group.schedule,
      level: this.data.group.level,
      period: this.data.group.period,
      status: 'active',
      minCapacity: this.data.group.minCapacity,
      maxCapacity: this.data.group.maxCapacity,
      course: this.data.group.course,
    };

    this.groupProv.createGroup(dataGroup).subscribe(async group => {

      for await (const student of this.selectedEnglishStudents) {

        let dataRequest = {
          group: group._id,
          status: 'studying',
        }
        await this.requestCourseProv.updateRequestById(student.requestId, dataRequest).subscribe(async res => {

          await this.englishStudentProv.updateEnglishStudent({ status: 'studying' }, student._id).subscribe(async res2 => {

          }, () => {
            this.loadingService.setLoading(false);
          });

        },
          error => {  });

      }

      this.dialogRef.close();

    },
      error => {  });
  }

}
