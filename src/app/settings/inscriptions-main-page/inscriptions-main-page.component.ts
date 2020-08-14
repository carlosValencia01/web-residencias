import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { CareerProvider } from 'src/app/providers/shared/career.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { NewPeriodComponent } from 'src/app/settings/new-period/new-period.component';
import { SecretaryAssignmentComponent } from 'src/app/settings/secretary-assignment/secretary-assignment.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inscriptions-main-page',
  templateUrl: './inscriptions-main-page.component.html',
  styleUrls: ['./inscriptions-main-page.component.scss']
})
export class InscriptionsMainPageComponent implements OnInit {
  periods = [];
  page = 1;
  pag;
  pageSize = 5;
  careers = {};

  constructor(
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionsProv: InscriptionsProvider,
    public dialog: MatDialog,
    private careerProv: CareerProvider,
    private stProv : StudentProvider,
    private loadingService: LoadingService,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }

    this.refreshDataSource();
   }

  ngOnInit() {
    this.getCareers();

  }
  pageChanged(ev) {
    this.page = ev;
  }
  swalDialog(title,msg,type){
    return Swal.fire({
      title: title,
      text: msg,
      type: type,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value)  return true;
      else return false;
    });
  }

  async updatePeriodo(row) {
    let confirmdialog = await this.swalDialog('¿Estás seguro de cerrar este Período ?',`El período (${row.periodName} ${row.year}) será desactivado.`,'question');
    if(confirmdialog){
      row.active = false;
      this.confirmedPeriodChange(row,'Período cerrado correctamente.');
    }
  }

  confirmedPeriodChange(row, msg){

    this.inscriptionsProv.updatePeriod(row,row._id).subscribe(res => {

      this.notificationsServices.showNotification(eNotificationType.SUCCESS,
        'Exito', msg);
        this.refreshDataSource();
    });
  }

  refreshDataSource() {
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {
        this.periods=periods.periods;
        this.periods.reverse();
        sub.unsubscribe();
      });
  }

  private async addPeriod(period, currentYear){

    // period.year = currentYear+'';
    period.active = true;

    let confirmdialog = await this.swalDialog('¿Estás seguro de crear este Período ?',`El período (${period.periodName} ${period.year}) será activado.`,'question');

    if(confirmdialog){
      this.inscriptionsProv.createPeriod(period).subscribe(async res => {
        this.inscriptionsProv.getAllFolders().subscribe(
          async fold=>{
            const folders = fold.folders;
            const rootFolder = folders.filter(folder => folder.name === 'Expedientes')[0];
            if(rootFolder){
              const inscriptionFolder = folders.filter(folder => folder.name === 'Expedientes nuevo ingreso')[0];
              const receptionActFolder = folders.filter(folder => folder.name === 'Expedientes titulación')[0];

              await this.createInscriptionFolder(rootFolder.idFolderInDrive,inscriptionFolder,period.year+' '+period.periodName,res.period._id);

              await this.createReceptionActFolder(rootFolder.idFolderInDrive,receptionActFolder,period.year+' '+period.periodName,res.period._id);

            }else{

              this.inscriptionsProv.createFolder('Expedientes',res.period._id,0).subscribe(
                async exp=>{
                  await this.createInscriptionFolder(exp.folder.idFolderInDrive,null,period.year+' '+period.periodName,res.period._id);

                  await this.createReceptionActFolder(exp.folder.idFolderInDrive,null,period.year+' '+period.periodName,res.period._id);

                }
              )
            }
          }
        );
        this.notificationsServices.showNotification(eNotificationType.SUCCESS,
          'Período creado', `El período '${period.periodName} - ${period.year}' ha sido creado.`);
        this.refreshDataSource();
      });
    }
  }

  async createInscriptionFolder(rootF,insFolder,periodName,periodId){
    if(insFolder){
      await  this.inscriptionsProv.createSubFolder(periodName,periodId, insFolder.idFolderInDrive,1).subscribe(res=>{
      },
      err=>{
      }
      );
    }else{
      await this.inscriptionsProv.createSubFolder('Expedientes nuevo ingreso',periodId,rootF,1).subscribe(
        async res=>{
          await  this.inscriptionsProv.createSubFolder(periodName,periodId, res.folder.idFolderInDrive,1).subscribe(ress=>{
          },
          err=>{
          }
          );;
        },
        err=>{
          console.log(err);
        }
      );
    }
  }
  async createReceptionActFolder(rootF,recepFolder,periodName,periodId){
    if(recepFolder){
      await  this.inscriptionsProv.createSubFolder(periodName,periodId, recepFolder.idFolderInDrive,2).subscribe(res=>{
      },
      err=>{
      });
    }else{
      await this.inscriptionsProv.createSubFolder('Expedientes titulación',periodId,rootF,2).subscribe(
        async res=>{
          await  this.inscriptionsProv.createSubFolder(periodName,periodId, res.folder.idFolderInDrive,2).subscribe(ress=>{
          },
          err=>{
          }
          );
        },
        err=>{
          console.log(err);
        }
      );
    }
  }

  createPeriod(){
    let lastActivePeriod, currentYear;
    if(this.periods.length>0){
      lastActivePeriod = this.periods[0];
      currentYear = lastActivePeriod.periodName === 'AGOSTO-DICIEMBRE' ? (parseInt(lastActivePeriod.year)+1) : lastActivePeriod.year;

      let activePeriod = this.periods.filter( period=> period.active === true).length > 0;
      if(activePeriod) {
        this.notificationsServices.showNotification(eNotificationType.ERROR,
          'Período activo', `Ya existe un período activo '${lastActivePeriod.periodName}' no es posible crear otro período.`);
          // this.refreshDataSource();
        return;
      }
    }else if(this.periods.length == 0){
      lastActivePeriod=0;
      currentYear = new Date;
      currentYear = currentYear.getFullYear();
    }

    const linkModal = this.dialog.open(NewPeriodComponent, {
      data: {
        operation: 'create',
        initialPeriod: lastActivePeriod === 0 ? 'true' : lastActivePeriod.periodName === 'AGOSTO-DICIEMBRE' ? 'ENERO-JUNIO' : 'AGOSTO-DICIEMBRE',
        year:currentYear
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em',
      height: '720px'
    });
    let sub = linkModal.afterClosed().subscribe(
      period=>{
        if(period.action === 'submit'){
          this.addPeriod(period.period,currentYear);
        }
        // else this.refreshDataSource();
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  editPeriod(period){
    const linkModal = this.dialog.open(NewPeriodComponent, {
      data: {
        operation: 'edit',
        period: period
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em',
      height: '720px'
    });
    let sub = linkModal.afterClosed().subscribe(
      period=>{
        if(period.action === 'edit'){
          this.confirmedPeriodChange(period.period,'Periodo actualizado correctamente.');
        }
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  periodDetail(period){
    let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };    
    Swal.fire({
      html:
        `<h4>General</h4>
          <p style="text-align='left'">
            <h6><b>Fecha inicio:</b> ${new Date(period.initDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha fin:</b> ${new Date(period.endDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <br>
          </p>
          <h4>Período inscripciones</h4>
          <p style="text-align='left'">
            <h6><b>Fecha inicio:</b> ${new Date(period.insPerInitDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha fin:</b> ${new Date(period.insPerEndDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha entrega de certificado:</b> ${new Date(period.certificateDeliveryDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <br>
          </p>
          <h4>Período acto recepcional</h4>
          <p style="text-align='left'">
            <h6><b>Fecha inicio:</b> ${new Date(period.arecPerInitDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha fin:</b> ${new Date(period.arecPerEndDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <br>
          </p>
          <h4>Período cursos de ingles</h4>
          <p style="text-align='left'">
            <h6><b>Fecha inicio:</b> ${new Date(period.englishPerInitDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha fin:</b> ${new Date(period.englishPerEndDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <br>
          </p>
          <h4>Horario acto recepcional</h4>
          <p style="text-align='left'">
            <h6><b>Hora inicio:</b> ${period.arecInitShed}</h6>
            <h6><b>Hora fin:</b> ${period.arecEndShed}</h6>
            <br>
          </p>
        `,
      allowOutsideClick: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Regresar'
    }).then((result) => { });
  }

  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      res=>{
        if(res.careers){
          let  careers = res.careers;
          careers.forEach( career => {
            this.careers[career.fullName] = career._id;
          });
        }
      });
  }

  updateCareer(){
        this.stProv.getAllStudents().subscribe(
          async res2=>{
            let students = res2.students;
            for await (const student of students){
              let career = this.careers[student.career];
              let f = await this.up(student,career);
            }
            this.notificationsServices.showNotification(eNotificationType.SUCCESS,
              'Carreras agregadas', '');
          }
        );
  }
 async up(student,career){
    return await this.stProv.updateStudent(student._id,{careerId:career}).toPromise()
              .then(
                rest=>{return rest;
                }
              ).catch( err=>console.log(err)
              );
  }
  insert(){
    let careers = [
      {fullName:'ARQUITECTURA',shortName:'ARQUITECTURA',acronym:'ARQ'},
      {fullName:'INGENIERÍA CIVIL',shortName:'ING. CIVIL',acronym:'IC'},
      {fullName:'INGENIERÍA BIOQUÍMICA',shortName:'ING. BIOQUÍMICA',acronym:'IBQ'},
      {fullName:'INGENIERÍA EN GESTIÓN EMPRESARIAL',shortName:'ING. EN GESTIÓN EMPRESARIAL',acronym:'IGE'},
      {fullName:'INGENIERÍA QUIMICA',shortName:'ING. QUIMICA',acronym:'IQ'},
      {fullName:'INGENIERÍA MECATRÓNICA',shortName:'ING. MECATRÓNICA',acronym:'IM'},
      {fullName:'INGENIERÍA ELÉCTRICA',shortName:'ING. ELÉCTRICA',acronym:'IE'},
      {fullName:'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES',shortName:'ING. EN TICS',acronym:'ITICS'},
      {fullName:'INGENIERÍA EN SISTEMAS COMPUTACIONALES',shortName:'ING. EN SISTEMAS COMPUTACIONALES',acronym:'ISC'},
      {fullName:'INGENIERÍA INDUSTRIAL',shortName:'ING. INDUSTRIAL',acronym:'II'},
      {fullName:'LICENCIATURA EN ADMINISTRACIÓN',shortName:'LIC. ADMINISTRACIÓN',acronym:'LA'},
      {fullName:'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN',shortName:'M. EN TECNOLOGÍAS DE LA INFORMACIÓN',acronym:'MTI'},
      {fullName:'MAESTRÍA EN CIENCIAS EN ALIMENTOS',shortName:'M. CIENCIAS EN ALIMENTOS',acronym:'MCA'},
      {fullName:'DOCTORADO EN CIENCIAS EN ALIMENTOS',shortName:'D. CIENCIAS EN ALIMENTOS',acronym:'DCA'},
    ];
    this.careerProv.newCareer({careers:careers}).subscribe(
      res=>{
        this.notificationsServices.showNotification(eNotificationType.SUCCESS,
        'Carreras creadas', '');
        this.getCareers();
      },
      err=>console.log(err)
    );
  }

  secretaryAssignment(period?){
    this.dialog.open(SecretaryAssignmentComponent, {
      data: {
        operation: 'create',
        period: period
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em',
      height: '620px'
    });
  }

  async insertSignedUpStudents(){
    const insertStudents = await this.showAlert('¿Insertar los nuevos alumnos inscritos?');
    if(insertStudents){
      this.loadingService.setLoading(true);
      await this.stProv.insertSignedUpStudents().toPromise().then(
        inserted=>{
          this.loadingService.setLoading(false);
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Configuraciones','Se insertaron '+inserted.created+' alumnos')
        },
        err=> this.loadingService.setLoading(false)
      ).catch(err => this.loadingService.setLoading(false));
    }
  }
  showAlert(message: string, buttons: { accept: string, cancel: string } = { accept: 'Aceptar', cancel: 'Cancelar' }):any {
    return new Promise((resolve) => {
      Swal.fire({
        title: message,
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: buttons.cancel,
        confirmButtonText: buttons.accept
      }).then((result) => {
        if (result.value) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

}
