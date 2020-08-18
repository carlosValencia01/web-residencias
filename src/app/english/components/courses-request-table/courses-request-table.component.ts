import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RequestCourseProvider } from '../../providers/request-course.prov';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { MatAutocomplete, MatChipInputEvent } from '@angular/material';
import { FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { EnglishCourseProvider } from '../../providers/english-course.prov';
import TableToExcel from '@linways/table-to-excel';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import * as moment from 'moment';
import { EnglishStudentProvider } from '../../providers/english-student.prov';
@Component({
  selector: 'app-courses-request-table',
  templateUrl: './courses-request-table.component.html',
  styleUrls: ['./courses-request-table.component.scss']
})
export class CoursesRequestTableComponent implements OnInit {

  // Periods 
  periods = [];
  filteredPeriods = [];
  // periods used to filter data
  usedPeriods = [];
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('periodInput') periodInput: ElementRef<HTMLInputElement>;
  periodCtrl = new FormControl();

  // table sources
  displayedColumns: string[] = ['controlNumber', 'fullName', 'phone', 'career','course','level','status', 'actions'];
  dataSource: MatTableDataSource<any>;  
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  requestsCourses: Array<any> = [];

  filters = { // management of active filters
    courses:{
      all:true,
      value:''
    },
    level:{
      all:true,
      value:''
    },
    textSearch:{
      status:false,
      value:''
    }
  };

  activeCourses: Array<any> = [];
  constructor(
    private requestCourseProv: RequestCourseProvider,
    private requestProvider: RequestProvider,
    private englishCourseProv: EnglishCourseProvider,
    private notificationService: NotificationsServices,
    private loadingService: LoadingService,
    private englishStudentProv : EnglishStudentProvider,
  ) {
    this.dataSource = new MatTableDataSource();
   }

  async ngOnInit() {

    await this.getData();
    
    this.requestProvider.getPeriods().subscribe(
      (periods) => {
        this.periods = periods.periods;
        this.filteredPeriods = periods.periods;
        this.englishCourseProv.getAllEnglishCourseActive().subscribe(data=>this.activeCourses = data.englishCourses
        );
        this.updatePeriods(this.filteredPeriods.filter(per => per.active === true)[0], 'insert');
      }
    );
  }

  getData(){
    return new Promise((resolve)=>{
      this.requestCourseProv.getAllRequestCourse().subscribe((data)=>{
        // read the request
        this.requestsCourses = data.requestCourses.filter(co=>co.status == 'requested').map(req=>{
          let tmpDate = new Date();
          const startHour = req.group.schedule[0].startHour;
          tmpDate.setHours(startHour / 60, startHour % 60, 0, 0); // set the start hour of course for export
          req.courseHour = tmpDate;
          return req;
        });
        
        // create table data
        this.dataSource = new MatTableDataSource(this.requestsCourses);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort; 
        
        resolve(true);    
      });
    });
  }
  /**
   * 
   * @param requestId the Id of request
   * Change status of request to rejected
   * Add observation
   */
  async declineRequest(request){        
    const confirmdialog = await this.swalDialogInput('DECLINAR SOLICITUD','Especifique el motivo');
    if(confirmdialog){
      const data ={status:'rejected',rejectMessage:confirmdialog};
      this.requestCourseProv.updateRequestById(request._id,data).subscribe(updated=>{});
      this.englishStudentProv.updateEnglishStudent(data,request.englishStudent._id).subscribe(updated=>{});
      await this.getData();
      this.applyFilters();
    }
  }
  /**
   * Open a swal modal with an input text
   * @param title title of the message
   * @param msg message
   */
  swalDialogInput(title: string,msg: string) {
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
      return result.value ?  result.value !== '' ? result.value : false : false;
    });
  }

  // FILTER PERIODS
  /**
   * 
   * @param period the period to filter
   * new period was selected in filters
   */
  slectedPeriod(period): void{
    this.updatePeriods(period,'insert');
  }

  /**
   * 
   * @param event chip input event
   * keep the autocomplete working well
   */
  addPeriod(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if (input) {
        input.value = '';
      }
      this.periodCtrl.setValue(null);
    }
  }

  /**
   * Keep the period filter synchronized
   * @param period the period to be uptated (add to filter or remove)
   * @param action the action to do with the period filter
   * 
   */
  updatePeriods(period, action: string): void {
    if (action === 'delete') {
      this.filteredPeriods.push(period);
      this.usedPeriods = this.usedPeriods.filter( per => per._id !== period._id);
    }
    if (action === 'insert') {
      this.usedPeriods.push(period);
      this.filteredPeriods = this.filteredPeriods.filter(per => per._id !== period._id);
    }
    this.periods = this.filteredPeriods;
    if(this.periodInput) this.periodInput.nativeElement.blur(); // set focus
    this.applyFilters();
  }

  /**
   * Quit a period from the filter
   * @param period the period to be deleted
   */
  removePeriod(period): void {
    this.updatePeriods(period, 'delete');
  }

  /**
   * Filter period giving the name with the keyboard
   * @param value text to filter
   */
  filterPeriod(value: string): void {
    if (value) {
      this.periods = this.periods.filter( period => (period.periodName + '-' + period.year).toLowerCase().trim().indexOf(value) !== -1);
    }
  }
  // END FILTER PERIOD

  // ACTIVE FILTERS
  /**
   * Get ready the filters to apply
   * @param type name of filter
   * @param event value to filter
   */
  filter(type: string, event: Event){
    const filterValue: string = (event.target as HTMLInputElement).value.trim().toLowerCase();  
    
    switch(type){
      case 'courses':{ // filter the courses
        if(filterValue == 'default'){          
          this.filters.courses.all = true;
          this.filters.courses.value = '';         
        }else{
          this.filters.courses.all = false;
          this.filters.courses.value = filterValue;          
        }
        break;
      }      
      case 'level':{ // filter the level
        if(filterValue == 'default'){          
          this.filters.level.all = true;
          this.filters.level.value = '';         
        }else{
          this.filters.level.all = false;
          this.filters.level.value = filterValue;          
        }
        break;
      }      
      case 'search':{ // filter by text input
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
  /**
   * Filter data in table
   */
  applyFilters(){    
    
    this.dataSource.data = this.requestsCourses;
    if(this.usedPeriods){
      if (this.usedPeriods.length > 0) {                
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => this.usedPeriods.map( per => (per._id)).includes((req.period))
        );            
      } else {
        this.dataSource.data = this.dataSource.data;
      }
    }else {
      this.dataSource.data = this.dataSource.data;
    }
    
    if(!this.filters.level.all){ // filter by level
      this.dataSource.data = this.dataSource.data.filter(req=>req.level == this.filters.level.value);
    }
    if(!this.filters.courses.all){ // filter courses
      if(this.filters.courses.value == '18'){ // has 18 or more requests
        // array with the arrays of requests that can be filtered
        let requests = [];
        console.log(this.dataSource.data);
             
        this.activeCourses.forEach( (course )=> {
          // filter request by the course
          
          const requestsByCourse = this.dataSource.data.filter(req=>(req.group.course._id+'') == (course._id+''));          
          if(requestsByCourse.length >= 18){
            // update the request to filter
            requests.push(requestsByCourse);
          }
        });
        // the request to display in table
        this.dataSource.data = requests.reduce((prev,curr)=>{
          return prev.concat(curr); // join all request by course that has >=18 request
        },[]);        
      }else{ // filter by one course
        this.dataSource.data = this.dataSource.data.filter(req=>(req.group.course._id+'').toLowerCase()==this.filters.courses.value);
      }
    }
    
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async excelExport() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);    
    
    await this.delay(200);
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte solicitudes SGCLE.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }

}
