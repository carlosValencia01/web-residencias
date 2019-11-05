import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { MatDialog } from '@angular/material';
import { NewPeriodComponent } from 'src/modals/inscriptions/new-period/new-period.component';

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

  constructor(
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionsProv: InscriptionsProvider, 
    public dialog: MatDialog,
  ) {    
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    
    this.refreshDataSource();
   }

  ngOnInit() {
    
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
    let confirmdialog = await this.swalDialog('¿Estás seguro de cerrar este Periodo ?',`El periodo (${row.periodName} ${row.year}) será desactivado.`,'question');
    if(confirmdialog){
      row.active = false;
      this.confirmedPeriodChange(row,'Periodo cerrado correctamente.');
    }
  }

  confirmedPeriodChange(row, msg){  
    console.log(row);
          
    // const customPeriod = {      
    //   periodName: row.periodName,
    //   year: row.year,
    //   initDate: row.initDate,      
    //   endDate: row.endDate,      
    //   insPerInitDate: row.insPerInitDate,      
    //   insPerEndDate: row.insPerEndDate,      
    //   arecPerInitDate: row.arecPerInitDate,      
    //   arecPerEndDate: row.arecPerEndDate,      
    //   arecInitShed: row.arecInitShed,      
    //   arecEndShed: row.arecEndShed,      
    //   active: false
    // };
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
        // console.log(this.periods);
              
        sub.unsubscribe();
      });
  }
  
  private async addPeriod(period, currentYear){         

    period.year = currentYear+'';
    period.active = true;

    let confirmdialog = await this.swalDialog('¿Estás seguro de crear este Periodo ?',`El periodo (${period.periodName} ${period.year}) será activado.`,'question');

    if(confirmdialog){
      this.inscriptionsProv.createPeriod(period).subscribe(async res => {        
        
        this.inscriptionsProv.createFolder(period.periodName+' '+period.year,res.period._id).subscribe(
          res=>{
            this.notificationsServices.showNotification(eNotificationType.SUCCESS,
              'Exito', 'Periodo creado correctamente.'); 
            
              this.refreshDataSource();
          },
          err=>{
            console.log(err);
                 
          }
        );                       
        
      });
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
          'Periodo activo', `Ya existe un periodo activo '${lastActivePeriod.periodName}' no es posible crear otro periodo.`);
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
      height: '620px'
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
      height: '620px'
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
          <h4>Periodo inscripciones</h4>
          <p style="text-align='left'">
            <h6><b>Fecha inicio:</b> ${new Date(period.insPerInitDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha fin:</b> ${new Date(period.insPerEndDate).toLocaleDateString("es-MX", dateOptions)}</h6>        
            <br>
          </p>
          <h4>Periodo acto recepcional</h4>
          <p style="text-align='left'">
            <h6><b>Fecha inicio:</b> ${new Date(period.arecPerInitDate).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha fin:</b> ${new Date(period.arecPerEndDate).toLocaleDateString("es-MX", dateOptions)}</h6>        
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
 
}
