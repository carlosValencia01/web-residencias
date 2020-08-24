import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GroupProvider } from 'src/app/english/providers/group.prov';
import Swal from 'sweetalert2';
import { IGroup } from '../../entities/group.model';
import { IRequestCourse } from '../../entities/request-course.model';
import { EnglishStudentProvider } from '../../providers/english-student.prov';
import { RequestCourseProvider } from '../../providers/request-course.prov';

@Component({
  selector: 'app-active-group-modal',
  templateUrl: './active-group-modal.component.html',
  styleUrls: ['./active-group-modal.component.scss']
})
export class ActiveGroupModalComponent implements OnInit {
  dataSourceRequest: MatTableDataSource<any>;
  @ViewChild('matPaginatorRequest') set paginatorRequest(paginator: MatPaginator) {
    this.dataSourceRequest.paginator = paginator;
  }
  request: IRequestCourse[];
  public groupSize = 18;

  constructor(
    public dialogRef: MatDialogRef<ActiveGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { students: IRequestCourse[], group: IGroup },
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private groupProv: GroupProvider,
  ) {
    this.dataSourceRequest = new MatTableDataSource();
    this.getRequest();
  }

  ngOnInit() {

  }

  getRequest() {
    this.request = this.data.students;
    this.dataSourceRequest.data = this.request;
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  activeGroup() {
    const size = this.groupSize;
    const baseGroup = this.data.group;
    const newGroup = {
      status: 'active',
      name: baseGroup.name,
      schedule: baseGroup.schedule,
      level: baseGroup.level,
      period: baseGroup.period._id,
      course: baseGroup.course._id,
    }
    const studentsGroup = this.request.slice(0, this.groupSize);

    // Registrar nuevo grupo
    this.groupProv.createGroup(newGroup).subscribe(res => {
      if (res) {
        const data = {
          groupId: res._id,
          students: studentsGroup
        }
        // Actualizar group id de la solicitud de curso
        this.requestCourseProv.activeRequest(data).subscribe(updated => {
          if (updated) {
            this.dialogRef.close({ action: 'saved' });
          }
        });
      }
    });

  }

  async declineRequest(request) {
    const confirmdialog = await this.swalDialogInput('DECLINAR SOLICITUD', 'Especifique el motivo');
    if (confirmdialog) {
      const data = { status: 'rejected', rejectMessage: confirmdialog };
      this.requestCourseProv.updateRequestById(request._id, data).subscribe(updated => { });
      this.englishStudentProv.updateEnglishStudent(data, request.englishStudent._id).subscribe(updated => { });
      this.groupProv.getAllStudentsGroup(this.data.group._id).subscribe(res => {
        if (res) {
          const students = res.students;
          this.request = students;
          this.dataSourceRequest.data = this.request;
        }
      });
    }
  }
  /**
 * Open a swal modal with an input text
 * @param title title of the message
 * @param msg message
 */
  swalDialogInput(title: string, msg: string) {
    return Swal.fire({
      title: title,
      text: msg,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar',
      input: 'text',
      inputValidator: (value) => {
        if (!value) {// validate empty input
          return '¡Ingresa el motivo!';
        }
      }
    }).then((result) => {
      return result.value ? result.value !== '' ? result.value : false : false;
    });
  }

}
