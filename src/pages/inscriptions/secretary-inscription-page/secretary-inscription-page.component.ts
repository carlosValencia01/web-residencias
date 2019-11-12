import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { MatDialog } from '@angular/material';
import { ReviewExpedientComponent } from 'src/modals/inscriptions/review-expedient/review-expedient.component';
import { StudentInformationComponent } from 'src/modals/inscriptions/student-information/student-information.component';
import { ReviewAnalysisComponent } from 'src/modals/inscriptions/review-analysis/review-analysis.component'
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-secretary-inscription-page',
  templateUrl: './secretary-inscription-page.component.html',
  styleUrls: ['./secretary-inscription-page.component.scss']
})
export class SecretaryInscriptionPageComponent implements OnInit {
  students;
  listStudents;
  periods = [];
  loading = false;

  rolName;

  // filter nc,nombre
  public searchText: string;
  public searchCarreer = '';

  public searchEC = false;
  public searchE = false;
  public searchEP = false;
  public searchV = false;
  public searchA = false;

  public EC = '';
  public E = '';
  public EP = '';
  public V = '';
  public A = '';

  //Paginator
  page = 1;
  pag;
  pageSize = 10;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private router: Router,
  ) { 
    this.rolName = this.cookiesService.getData().user.rol.name;
    console.log(this.rolName);
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.getStudents();
    this.getPeriods();
  }

  ngOnInit() {
    
  }

  getStudents(){
    this.inscriptionsProv.getStudents().subscribe(res => {
      this.students = res.students;
      this.listStudents = this.students;
      console.log(this.listStudents);
    });
  }

  pageChanged(ev) {
    this.page = ev;
  }

  // Obetener Valor del checkbox de Estatus
  eventFilterStatus() {
    if (this.searchEC) {
      this.EC = 'En Captura';
    } else {
      this.EC = '~';
    }
    if (this.searchE) {
      this.E = 'Enviado';
    } else {
      this.E = '~';
    }
    if (this.searchEP) {
      this.EP = 'En Proceso';
    } else {
      this.EP = '~';
    }
    if (this.searchV) {
      this.V = 'Verificado';
    } else {
      this.V = '~';
    }
    if (this.searchA) {
      this.A = 'Aceptado';
    } else {
      this.A = '~';
    }

    this.listStudents = this.filterItems(
      this.searchCarreer,
      this.EC,
      this.E,
      this.EP,
      this.V,
      this.A
    );

    //console.log(this.listStudents);

    if (Object.keys(this.listStudents).length === 0) {
      if (!this.searchEC && !this.searchE && !this.searchEP && !this.searchV && !this.searchA) {
        this.listStudents = this.students;
      }
    }
  }

   // FILTRADO POR CARRERA O ESTATUS
   filterItems(carreer, EC, E, EP, V, A) {
    return this.students.filter(function (student) {
      //console.log(student);
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1 && (
        student.inscriptionStatus.toLowerCase().indexOf(EC.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(E.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(EP.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(V.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(A.toLowerCase()) > -1);
    });
  }

  getPeriods(){
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {       
        this.periods=periods.periods;     
        console.log(this.periods); 
        this.periods.reverse();                        
        sub.unsubscribe();
      });
  }

  updateGI(student){
    //console.log(student);
    const linkModal = this.dialog.open(StudentInformationComponent, {
      data: {
        operation: 'view',
        student:student
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      information=>{         
        console.log(information);
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  viewExpedient(student){
    const linkModal = this.dialog.open(ReviewExpedientComponent, {
      data: {
        operation: 'view',
        student:student
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      expedient=>{         
        console.log(expedient);
        
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  // Exportar alumnos a excel
  excelExport() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte Alumnos Inscripcion.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

  // Generar Carátulas
  generateCovers() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'GENERANDO CARÁTULAS', '');
    this.loading = true;
    // METODO AQUI
    this.loading = false;
  }

  // Generar Pestañas
  generateLabels() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'GENERANDO PESTAÑAS', '');
    this.loading = true;
    // METODO AQUI
    this.loading = false;
  }

  viewAnalysis(student){
    const linkModal = this.dialog.open(ReviewAnalysisComponent, {
      data: {
        operation: 'view',
        student:student
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      analysis=>{         
        console.log(analysis);
        
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

}
