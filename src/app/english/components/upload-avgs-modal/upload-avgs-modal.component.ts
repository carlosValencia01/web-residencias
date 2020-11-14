import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// SERVICIOS
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

// PROVEEDORES
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';

// MODELOS
import { IGroup } from '../../entities/group.model';
import { IEnglishStudent } from '../../entities/english-student.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
export interface DialogData {
  group: IGroup,
  students: Array<any>
}

@Component({
  selector: 'app-upload-avgs-modal',
  templateUrl: './upload-avgs-modal.component.html',
  styleUrls: ['./upload-avgs-modal.component.scss']
})
export class UploadAvgsModalComponent implements OnInit {

  dataSource: MatTableDataSource<any>;

  @ViewChild('matPaginatorEnglishStudents') paginatorStudents: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sortStudents') sortStudents: MatSort;
  englishStudents = [];

  constructor(
    public dialogRef: MatDialogRef<UploadAvgsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private loadingService: LoadingService,
    private notificationService: NotificationsServices,
  ) { 
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    
    
  }

  createDataSource() {
    this.dataSource = new MatTableDataSource(this.englishStudents);
    this.dataSource.paginator = this.paginatorStudents;
    this.dataSource.sort = this.sortStudents;
  }

  public async onUpload(event) {
    this.loadingService.setLoading(true);

    if (event.target.files && event.target.files[0]) {
      let file= event.target.files[0];     
      let fileReader = new FileReader();    
      fileReader.readAsArrayBuffer(file);     
      fileReader.onload = (e) => {    
          const arrayBuffer: any = fileReader.result;    
          let data = new Uint8Array(arrayBuffer);    
          let arr = new Array();    
          for(let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);    
          const bstr = arr.join("");    
          const workbook = XLSX.read(bstr, {type:"binary"});             
          const first_sheet_name = workbook.SheetNames[0];    
          const worksheet = workbook.Sheets[first_sheet_name];             
          const arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:false});                     

          
          this.englishStudents = this.data.students.reduce((prev,curr)=>{
            // solo los alumnos que no se le ha registrado el promedio
            if(!curr.average){
              // alumnos de la lista en excel que se encuentran en el grupo
              if(arraylist.map(stu => stu['NO. CONTROL']).includes(curr.englishStudent.studentId.controlNumber)){
                prev.push({
                  _id: curr._id,
                  level: curr.level,
                  group: curr.group,
                  fullName: curr.englishStudent.studentId.fullName,
                  controlNumber: curr.englishStudent.studentId.controlNumber,
                  career: curr.englishStudent.studentId.careerId ? curr.englishStudent.studentId.careerId.shortName : '---',
                  email: curr.englishStudent.studentId.email,
                  phone: curr.englishStudent.currentPhone,
                  average: arraylist.find( stu => stu['NO. CONTROL'] == curr.englishStudent.studentId.controlNumber)['PROMEDIO'],
                  englishStudent:curr.englishStudent._id
      
                })
              }
            }
            return prev;
          },[]);
          this.createDataSource();
          this.loadingService.setLoading(false);
      }       
    }
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }
  sendAverages(){
    Swal.fire({
      title: 'GUARDAR CALIFICACIONES',
      text: `No podrá actualizar las calificaciones despues  ¿Desea continuar?`,
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
        this.notificationService.showNotification(eNotificationType.INFORMATION,'ÍNGLES','Registrando calificaciones');
        
      }
    });
    
  }

}
