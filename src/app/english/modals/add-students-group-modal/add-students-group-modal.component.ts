import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GroupProvider } from 'src/app/english/providers/group.prov';
import Swal from 'sweetalert2';
import { IGroup } from '../../entities/group.model';
import { IRequestCourse } from '../../entities/request-course.model';
import { EnglishStudentProvider } from '../../providers/english-student.prov';
import { RequestCourseProvider } from '../../providers/request-course.prov';
import { LoadingService } from 'src/app/services/app/loading.service';

@Component({
  selector: 'app-add-students-group-modal',
  templateUrl: './add-students-group-modal.component.html',
  styleUrls: ['./add-students-group-modal.component.scss']
})
export class AddStudentsGroupModalComponent implements OnInit {
  dataSource: MatTableDataSource<any>;
  englishStudents: any;
  searchStudent = '';

  @ViewChild('matPaginatorEnglishStudents') paginatorStudents: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sortStudents') sortStudents: MatSort;

  constructor(
    public dialogRef: MatDialogRef<AddStudentsGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private groupProv: GroupProvider,
    private loadingService: LoadingService
  ) {
    this.dataSource = new MatTableDataSource();
    this.getRequest(data.groupOrigin);
   }

  ngOnInit() {

  }

  getRequest(idOriginGroup) {
    if(idOriginGroup){
      this.loadingService.setLoading(true);
      this.groupProv.getAllStudentsGroup(idOriginGroup).subscribe(res => {
        this.dataSource.data = res.students;
        this.dataSource.paginator = this.paginatorStudents;
        this.dataSource.sort = this.sortStudents;
      }, error => {
  
      }, () => this.loadingService.setLoading(false));
    }
  }
  

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  addRequest(student){
    const data = {
      activeGroup: this.data.groupActive,
      req: student
    }
    Swal.fire({
      title: 'Agregar estudiante',
      text: `Está por agregar al curso al estudiante ` + student.englishStudent.studentId.fullName + `. ¿Desea continuar?`,
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
        this.requestCourseProv.addRequest(data).subscribe(updated => {
          if (updated) {
            this.getRequest(this.data.groupOrigin);
            Swal.fire({
              title: 'Alumno agregado con exito!',
              showConfirmButton: false,
              timer: 2500,
              type: 'success'
            });
          }
        });
        this.loadingService.setLoading(false);
      }
    });
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

}
