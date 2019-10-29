import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

import Swal from 'sweetalert2';
@Component({
  selector: 'app-inscriptions-main-page',
  templateUrl: './inscriptions-main-page.component.html',
  styleUrls: ['./inscriptions-main-page.component.scss']
})
export class InscriptionsMainPageComponent implements OnInit {

  
  periods = [];
  constructor(
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionsProv: InscriptionsProvider, 
  ) {    
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    
    this.refreshDataSource();
   }

  ngOnInit() {
    
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

  async updatePeriodo(row, i) {      
    let confirmdialog = await this.swalDialog('¿Estás seguro de cerrar este Periodo ?',`El periodo (${row.name} ${row.year}) será desactivado.`,'question');
    if(confirmdialog){
      this.confirmedPeriodChange(row);
    }
  }

  confirmedPeriodChange(row){        
    const customPeriod = {      
      name: row.name,
      year: row.year,
      initDate: row.initDate,
      endDate: new Date(),
      active: false
    };
    this.inscriptionsProv.updatePeriod(customPeriod,row._id).subscribe(res => {    
              
      this.notificationsServices.showNotification(eNotificationType.SUCCESS,
        'Exito', 'Periodo cerrado correctamente.');
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
  
  async createPeriod(){
    let lastActivePeriod;
    let newPeriod,currentYear,initialPeriod;
    
    if(this.periods.length>0){
      lastActivePeriod = this.periods[0].name;   
      currentYear = this.periods[0].year;
      if (this.periods[0].name === 'Agosto-Diciembre') {
        currentYear++;
      }
    }
    else{
      lastActivePeriod = 0;
      currentYear = new Date;
      currentYear = currentYear.getFullYear();
      initialPeriod =document.getElementById('periodo');
    } 
      

    newPeriod = lastActivePeriod === 0 ? initialPeriod.value :  lastActivePeriod === 'Agosto-Diciembre' ? 'Enero-Junio' : 'Agosto-Diciembre';  

    for (let i = 0; i < this.periods.length; i++) {
      if (this.periods[i].active === true) {
        this.notificationsServices.showNotification(eNotificationType.ERROR,
          'Periodo activo', `Ya existe un periodo activo '${lastActivePeriod}' no es posible crear otro periodo.`);
        return;
      }
    }        

    let period = {
      name: newPeriod,
      year: currentYear+'',
      // fechaApertura: new Date(),
      // fechaCierre : new Date(),
      active: true
    };
    let confirmdialog = await this.swalDialog('¿Estás seguro de crear este Periodo ?',`El periodo (${period.name} ${period.year}) será activado.`,'question');

    if(confirmdialog){
      this.inscriptionsProv.createPeriod(period).subscribe(async res => {        
        
        this.inscriptionsProv.createFolder(period.name+' '+period.year,res.period._id).subscribe(
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
 
}
