import { Component, OnInit, ViewChild, Input, Output, EventEmitter, SimpleChanges, ElementRef, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IStudentExpedient } from 'src/app/entities/inscriptions/studentExpedient.model';
import { ICareer } from 'src/app/entities/app/career.model';
import { StudentInformationComponent } from '../student-information/student-information.component';
import { MatDialog } from '@angular/material/dialog';
import { ReviewExpedientComponent } from '../review-expedient/review-expedient.component';
import { ReviewAnalysisComponent } from '../review-analysis/review-analysis.component';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import Swal, { SweetAlertType } from 'sweetalert2';
import { CareerProvider } from 'src/app/providers/shared/career.prov';
import { MatChipInputEvent } from '@angular/material';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { CookiesService } from 'src/app/services/app/cookie.service';

@Component({
  selector: 'app-expedent-table-component',
  templateUrl: './expedent-table-component.component.html',
  styleUrls: ['./expedent-table-component.component.scss']
})
export class ExpedentTableComponentComponent implements OnInit, OnChanges {

  @Input('students') students: Array<IStudentExpedient>;
  @Input('tabName') tabName: string;
  @Input('roleName') roleName: string;
  @Input('periods') periods: Array<any>;
  @Output() updateGIEmit = new EventEmitter();
  @Output() viewAnalysisEmit = new EventEmitter();
  @Output() viewExpedientEmit = new EventEmitter();
  @Output() updateSolicitudEmit = new EventEmitter();
  @Output() generateCredentialEmit = new EventEmitter(); 
  @Output() generateCoversEmit = new EventEmitter();  
  @Output() generateLabelsEmit = new EventEmitter();  
  @Output() getScheduleEmit = new EventEmitter();  
  @Output() generateCredentialsEmit = new EventEmitter();  
  @Output() getExcelExportEmit = new EventEmitter();  
  @Output() getExcelExportDebtsEmit = new EventEmitter();  
  @Output() getExcelExportIMSSEmit = new EventEmitter();  
  @Output() getScheduleExcelEmit = new EventEmitter();  
  @Output() excelExportCMEmit = new EventEmitter();  
  @Output() getCareerEmit = new EventEmitter();  
  @Output() getControlNumberEmit = new EventEmitter();  
  @Output() getUsedPeriodsEmit = new EventEmitter();   

  displayedColumns: string[] = ['controlNumber', 'fullName', 'career', 'avance','status','exp','actions'];
  dataSource: MatTableDataSource<IStudentExpedient>;
  
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator){
    this.dataSource.paginator = paginator;
  };
  @ViewChild(MatSort) set sort(sort: MatSort){
    this.dataSource.sort = sort;
  };
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('periodInput') periodInput: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  showTable: boolean = false;
  formatedStudents: Array<IStudentExpedient>  = [];
  careers: Array<ICareer>;
  filters = { //variable para controlar los filtros que estan activos
    career:{
      status:false,
      value:''
    },
    medicDict: {
      dictaminated:false,      
      all:true      
    },
    medicWarn: {
      warn:false,      
      all:true      
    },
    checkC: false,
    checkE: false,
    checkP: false,
    checkV: false,
    checkA: false,
    credentials:{
      printed:false,      
      all:true      
    },
    changes:{
      change:false,      
      all:true      
    },
    textSearch:{
      status:false,
      value:''
    }
  };
  filteredCareer: string;
  filteredPeriods;
  usedPeriods = [];
  localPeriods = [];
  periodCtrl = new FormControl();
  constructor(
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private studentProv: StudentProvider,
    private loadingService: LoadingService,
    private inscriptionsProv: InscriptionsProvider,
    private careerProv: CareerProvider,
    private cookieService: CookiesService
  ) {
    this.dataSource = new MatTableDataSource();
    this.getCareers();
  }

  ngOnInit() {
    if(this.roleName == 'Médico'){
      this.displayedColumns = ['controlNumber', 'fullName', 'career', 'medicDict','medicWarn','actions'];
    }        
    this.dataSource = new MatTableDataSource(this.students);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;        
    this.localPeriods = this.periods;    
    this.filteredPeriods = this.periods;
    this.showTable = true;
    this.updatePeriods(this.filteredPeriods.filter(per => per.active === true)[0], 'insert');
    this.applyFilters();
  }
  ngOnChanges(changes: SimpleChanges) { // cuando se actualiza algo en el padre  
        
    if(changes.students){
      this.dataSource.data = changes.students.currentValue;
      this.applyFilters();
    }
    if(changes.periods){
      this.usedPeriods = changes.periods.currentValue ? changes.periods.currentValue : this.usedPeriods;
      this.usedPeriods = this.usedPeriods.filter((item, pos, self)=> self.filter(per=>per.code !== item.code).length==0); //eliminar elementos duplicados            
      this.applyFilters();
    }
    
  }

  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      (res)=>{       
        
        this.careers = res.careers;        
      },
      err=>console.warn(err)
      
    );
  }
  

  
  filter(type: string, event: Event){ //funcion para controlar los filtros activos
    const filterValue: string = (event.target as HTMLInputElement).value.trim().toLowerCase();  
    
    switch(type){
      case 'career':{ //filtrar por carrera
        if(filterValue == 'default'){          
          this.filters.career.status = false;
          this.filters.career.value = '';
          this.filteredCareer = '';
        }else{
          this.filters.career.status = true;
          this.filters.career.value = filterValue;
          this.filteredCareer = this.careers.filter( car=> car.fullName.toLowerCase() == filterValue)[0].acronym;
        }
        this.getSearchCareer(); //emitir la carrera al padre
        break;
      }
      case 'credentials':{ //quienes ya se imprimio o no la credencial
        if(filterValue == 'default'){
          this.filters.credentials.all = true;          
        }else{
          this.filters.credentials.all = false;
          if(filterValue == 'false'){
            this.filters.credentials.printed = false;
          }else{
            this.filters.credentials.printed = true;
          }
        }
        break;
      }
      case 'changes':{ //quienes tienen un cambio en algun documento
        if(filterValue == 'default'){
          this.filters.changes.all = true;          
        }else{
          this.filters.changes.all = false;
          if(filterValue == 'false'){
            this.filters.changes.change = false;
          }else{
            this.filters.changes.change = true;
          }
        }
        break;
      }
      case 'check':{ //checkbox con los estatus
        switch(filterValue){
          case 'en proceso':{ //cambiamos el estado del filtro para los checks
            this.filters.checkP = !this.filters.checkP;
            break;
          }
          case 'en captura':{
            this.filters.checkC = !this.filters.checkC;
            break;
          }
          case 'enviado':{
            this.filters.checkE = !this.filters.checkE;
            break;
          }
          case 'verificado':{
            this.filters.checkV = !this.filters.checkV;
            break;
          }
          case 'aceptado':{
            this.filters.checkA = !this.filters.checkA;
            break;
          }
        }        
        break;
      }
      case 'medicWarn':{ //para la vista desde el rol de medico
        if(filterValue == 'default'){
          this.filters.medicWarn.all = true;          
        }else{
          this.filters.medicWarn.all = false;
          if(filterValue == 'false'){
            this.filters.medicWarn.warn = false;
          }else{
            this.filters.medicWarn.warn = true;
          }
        }
        break;
      }
      case 'medicDict':{ //para la vista desde el rol de medico
        if(filterValue == 'default'){
          this.filters.medicDict.all = true;          
        }else{
          this.filters.medicDict.all = false;
          if(filterValue == 'false'){
            this.filters.medicDict.dictaminated = false;
          }else{
            this.filters.medicDict.dictaminated = true;
          }
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
        this.getSearchControlNumber(); //emitir el numero de control al padre
        break;
      }
      
    }
    this.applyFilters();
    
  }
  applyFilters(){ //funcion para aplicar filtros activos
    this.dataSource.data = this.students;
    if(this.usedPeriods){
      if (this.usedPeriods.length > 0) {                
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => this.usedPeriods.map( per => (per._id)).includes((req.student.idPeriodInscription))
        );            
      } else {
        this.dataSource.data = this.dataSource.data;
      }
    }else {
      this.dataSource.data = this.dataSource.data;
    }
    if(this.filters.career.status){
      this.dataSource.data = this.dataSource.data.filter(st=>st.career.toLowerCase() == this.filters.career.value);
    }
    if(this.filters.textSearch.status){
      this.dataSource.data = this.dataSource.data.filter(st=>st.controlNumber.toLowerCase().indexOf(this.filters.textSearch.value) !=-1 || st.fullName.toLowerCase().indexOf(this.filters.textSearch.value) !=-1);
    }
    if(!this.filters.credentials.all){ //si no se quieren ver todos
      if(this.filters.credentials.printed){ //solo credenciales impresas
        this.dataSource.data = this.dataSource.data.filter( (st:any)=>st.student.printCredential);
      }else{
        this.dataSource.data = this.dataSource.data.filter( (st:any)=>!st.student.printCredential);
      }
    }
    if(!this.filters.changes.all){ //si no se quieren ver todos los alumnos (cambios y sin cambios)
      if(this.filters.changes.change){ //solo quienes tienen cambios        
        this.dataSource.data = this.dataSource.data.filter( (st:any)=> this.roleName == 'Administrador' ? st.student.documentsModifiedAdmin : st.student.documentsModified);
      }else{
        this.dataSource.data = this.dataSource.data.filter( (st:any)=>this.roleName == 'Administrador' ? !st.student.documentsModifiedAdmin : !st.student.documentsModified);
      }
    }
    let tmpA=[],tmpC=[],tmpE=[],tmpV=[],tmpP=[]; //variables temporales para guardar los alumnos por su estatus
    let filterStatusFlag = false; //variable para ver si al menos se filtro por un estatus
    if(this.filters.checkA){ //filtrar por status
      tmpA = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'aceptado'); 
      filterStatusFlag = true;           
    }
    if(this.filters.checkC){
      tmpC = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'en captura');  
      filterStatusFlag = true;               
    }
    if(this.filters.checkE){
      tmpE = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'enviado');
      filterStatusFlag = true;           
    }
    if(this.filters.checkV){
      tmpV = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'verificado'); 
      filterStatusFlag = true;                
    }
    if(this.filters.checkP){      
      tmpP = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'en proceso');
      filterStatusFlag = true;           
    }
    //se unen todos los arrays temporales para hacer un 'OR' de los status
    let tmpData = [].concat(tmpA,tmpE);    
    tmpData = tmpData.concat(tmpC);
    tmpData = tmpData.concat(tmpV);
    tmpData = tmpData.concat(tmpP);
    tmpData.sort(function (a, b) { //ordenar por apellidos
      return a.student.fatherLastName.localeCompare(b.student.fatherLastName);
    });
    if(filterStatusFlag){ //si hay filtro por estatus
      this.dataSource.data = tmpData;
    }    
  }

  updateGI(row){
    const linkModal = this.dialog.open(StudentInformationComponent, {
      data: {
        operation: 'view',
        student:row.student
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      information=>{      
      },
      err=>console.log(err), ()=> this.updateGIEmit.emit(false)
    );
    
  }
  viewAnalysis(row){
    if(row.student.documents != ''){
      var docAnalisis = row.student.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] ? row.student.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] : '';
      if(docAnalisis != ''){
        if(docAnalisis.status[docAnalisis.status.length-1].name == "VALIDADO" || docAnalisis.status[docAnalisis.status.length-1].name == "ACEPTADO"){
          const linkModal = this.dialog.open(ReviewAnalysisComponent, {
            data: {
              operation: 'view',
              student:row.student
            },
            disableClose: true,
            hasBackdrop: true,
            width: '90em',
            height: '800px'
          });
          let sub = linkModal.afterClosed().subscribe(
            analysis=>{              
            },
            err=>console.log(err), ()=> this.viewAnalysisEmit.emit(true)
          );
        } else {
          this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Aun no son Validados/Aceptados los análisis clínicos.');
        }
      } else {
        this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Alumno no tiene análisis clínicos.');
      }
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Alumno no tiene expediente.');
    }
    
  }
  viewExpedient(row){
    const linkModal = this.dialog.open(ReviewExpedientComponent, {
      data: {
        operation: 'view',
        student:row.student,
        user: this.roleName
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      expedient=>{ 
      },
      err=>console.log(err), ()=> this.viewExpedientEmit.emit(true)
      );
    
    
  }
  async registerCredential(row){
    const response = await this.showSwalAlert('Para ' + row.controlNumber,'Registrar Impresión de Credencial','question');
    if (response) {
      this.loadingService.setLoading(true);
      this.inscriptionsProv.updateStudent({printCredential:true},row.student._id).subscribe(res => {
      }, err=>{},
      ()=>{
        this.loadingService.setLoading(false);
        this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
        
      });
    }
    
  }
  async removeCredential(row){
    const response = await this.showSwalAlert('Para ' + row.controlNumber,'Remover Impresión de Credencial','question');
    if (response) {
      this.loadingService.setLoading(true);
      this.inscriptionsProv.updateStudent({printCredential:false},row.student._id).subscribe(res => {
      }, err=>{},
      ()=>{
        this.loadingService.setLoading(false);
        this.notificationService.showNotification(eNotificationType.SUCCESS, 'Inscripciones', 'Impresión Removida.');
        
      });
    }
  }
  updateSolicitud(row){
    this.updateSolicitudEmit.emit(row.student);
  }
  generateCredential(row){
    this.generateCredentialEmit.emit(row.student);
  }
  async updateExpedientStatus(row){
  
    const response = await this.showSwalAlert('Para ' + row.controlNumber,'Actualizar Estatus de Expediente','question');
    if (response) {
      const degree = row.student.careerId.acronym === 'DCA' ? 'doc' : row.student.careerId.acronym === 'MCA' || row.student.careerId.acronym === 'MTI' ? 'mas' : 'lic';
      this.studentProv.getDocumentsUpload(row.student._id).subscribe(res => {        
        const aceptedDocs = res.documents.filter( docc => docc.statusName == "ACEPTADO").length;
        const validatedDocs = res.documents.filter( docc => docc.statusName == "VALIDADO").length;
        const processDocs = res.documents.filter( docc => docc.statusName == "EN PROCESO").length;
        const totalDocs = processDocs + validatedDocs + aceptedDocs;
        if(degree === 'lic'){
            // Cambiar estatus a ACEPTADO
            if(aceptedDocs === 7 || aceptedDocs === 8 ){
              this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},row.student._id).subscribe(res => { });              
            return;
            }
            if(validatedDocs === 7 || validatedDocs === 8){
            // Cambiar estatus a VALIDADO
            this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},row.student._id).subscribe(res => { });
            
            return;
            }
        }
        if(degree === 'mas'){
            // Cambiar estatus a ACEPTADO
            if(aceptedDocs === 10){
              this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},row.student._id).subscribe(res => { });
              
            return;
            }
            if(validatedDocs === 10){
            // Cambiar estatus a VALIDADO
            this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},row.student._id).subscribe(res => { });
            
            return;
            }
        }
        if(degree === 'doc'){
            // Cambiar estatus a ACEPTADO
            if(aceptedDocs === 10){
              this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},row.student._id).subscribe(res => { });
              
            return;
            }
            if(validatedDocs === 10){
            // Cambiar estatus a VALIDADO
            this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},row.student._id).subscribe(res => { });
            
            return;
            }
        }
        if(processDocs === 0){
          // Cambiar estatus a EN PROCESO
          let query = { inscriptionStatus:"En Proceso" };
          this.inscriptionsProv.updateStudent(query, row.student._id).subscribe(res => {  });
          
          return;
        }
        
      });
    }    
  }
  async integratedExpedient(row){
    const response = await this.showSwalAlert('Para ' + row.controlNumber,'Integrar Expediente','question');
    if (response) {
      this.inscriptionsProv.updateStudent({expStatus:"Integrado"},row.student._id, ).subscribe(res => {
      }, err=>{},
      ()=>{
        this.notificationService.showNotification(eNotificationType.SUCCESS, 'Inscripciones', 'Expediente Integrado.');
        
      });
    }
  }
  async archivedExpedient(row){
    const response = await this.showSwalAlert('Para ' + row.controlNumber,'Archivar Expediente','question');
    if (response) {
      this.inscriptionsProv.updateStudent({expStatus:"Archivado"},row.student._id).subscribe(res => {
      }, err=>{},
      ()=>{
        this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Expediente Archivado.');
                
      });;
    }    
  }

  async showSwalAlert(msg: string, title: string,type: SweetAlertType){
    return await new Promise((resolve)=>{
      Swal.fire({
        title,
        text: msg,
        type,
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar'
      }).then((result) => {
        resolve(result.value);
      });
    });
  }
  getFilteredStudents(){
    return this.dataSource.filteredData.map((st:any)=>st.student);
  }
  generateCovers() {
    this.generateCoversEmit.emit(true);
  }
  generateLabels() {
    this.generateLabelsEmit.emit(true);
  }
  getSchedule(){
    this.getScheduleEmit.emit(this.getFilteredStudents());
  }
  generateCredentials(){
    this.generateCredentialsEmit.emit(true);
  } 
  excelExport(){
    this.getExcelExportEmit.emit(this.getFilteredStudents());
  }
  excelExportDebts(){
    this.getExcelExportDebtsEmit.emit(this.getFilteredStudents());
  }
  excelExportIMSS(){
    this.getExcelExportIMSSEmit.emit(this.getFilteredStudents());
  }
  getScheduleExcel(){
    this.getScheduleExcelEmit.emit(this.getFilteredStudents());
  }
  excelExportCM(){
    this.excelExportCMEmit.emit(this.getFilteredStudents());
  }
  getSearchCareer(){
    this.getCareerEmit.emit(this.filters.career.value);
  }
  getSearchControlNumber(){
    this.getControlNumberEmit.emit(this.filters.textSearch.value);
  }

 
  getUsedPeriods(){
    const periods = this.usedPeriods.length > 0  ? this.usedPeriods : this.localPeriods;        
    this.getUsedPeriodsEmit.emit(periods);
  }

  // FILTRO PERÍODOS
  slectedPeriod(period){
    this.updatePeriods(period,'insert');
  }

  addPeriod(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;      
      if (input) {
        input.value = '';
      }
      this.periodCtrl.setValue(null);
    }
  }

  updatePeriods(period, action) {    
    if(this.tabName == 'all'){
      if (action === 'delete') {
        this.filteredPeriods.push(period);
        this.usedPeriods = this.usedPeriods.filter( per => per._id !== period._id);
      }
      if (action === 'insert') {
        this.usedPeriods.push(period);
        this.filteredPeriods = this.filteredPeriods.filter(per => per._id !== period._id);
      }
      this.localPeriods = this.filteredPeriods;
      if(this.periodInput) this.periodInput.nativeElement.blur();
      this.applyFilters();
      this.getUsedPeriods();      
    }
  }

  remove(period): void {
    this.updatePeriods(period, 'delete');
  }

  filterPeriod(value) {
    this.localPeriods = this.filteredPeriods;
    if (value) {
      this.localPeriods = this.filteredPeriods.filter( period => (period.periodName + '-' + period.year).toLowerCase().trim().indexOf(value) !== -1);
    }
  }

}
