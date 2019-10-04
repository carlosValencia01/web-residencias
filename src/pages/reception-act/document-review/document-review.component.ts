import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { MatTableDataSource, MatSort, MatDialogRef, MAT_DIALOG_DATA, MatSidenav, MatDrawer } from '@angular/material';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ActivatedRoute, Params } from '@angular/router';
import { iRequest } from 'src/entities/reception-act/request.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-document-review',
  templateUrl: './document-review.component.html',
  styleUrls: ['./document-review.component.scss']
})
export class DocumentReviewComponent implements OnInit {
  displayedColumns: string[];
  opened = true;
  pdf: any;
  dataSource: MatTableDataSource<IDocument>;
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild(MatSort) sort: MatSort;

  documents: Array<IDocument>;
  request: iRequest;
  constructor(
    // public dialogRef: MatDialogRef<DocumentReviewComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    public requestProvider: RequestProvider,
    private notificationService: NotificationsServices,
    private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        console.log("Params", params);
        this.requestProvider.getRequestById(params.id).subscribe(
          data => {
            console.log("DATA", data);
            this.request = data.request[0];
            console.log("DATA", this.request);
            this.refresh();
            this.drawer.toggle();
          },
          error => {
            this.notificationService.showNotification(eNotificationType.ERROR,
              "Titulación App", error);
          }
        );
      }
    );

  }

  ngOnInit() {
    this.displayedColumns = ['Icon', 'Archivo', 'Fecha', 'Estatus', 'View', 'Action'];
  }

  refresh(): void {
    this.documents = [];
    this.request.documents.forEach(element => {
      // if (element.type !== eFILES.PROYECTO && element.type !== eFILES.RELEASED)
      this.documents.push({
        type: element.type, dateRegistered: element.dateRegister,
        status: this.getStatus(element.status), file: null, view: '', action: '', icon: ''
      });
    });
    // this.dataSource = new MatTableDataSource(this.documents);
    // this.dataSource.sort = this.sort;
  }

  view(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    this.requestProvider.getResource(this.request._id, type).subscribe(data => {
      this.pdf = data;
    }, error => {
      this.notificationService.showNotification(eNotificationType.ERROR,
        "Titulación App", error);
    });
  }
  getStatus(eStatus: string): string {
    let status = '';
    switch (eStatus) {
      case eStatusRequest.PROCESS: {
        status = 'Pendiente';
        break;
      }
      case eStatusRequest.ACCEPT: {
        status = 'Aceptado';
        break;
      }
      case eStatusRequest.REJECT: {
        status = 'Rechazado';
        break;
      }
      default: {
        status = 'Desconocido'
      }
    }
    return status;
  }
  check(type: eFILES, status: string): void {
    let update = {
      Document: type,
      Status: status,
      Observation: ''
    };
    if (status === eStatusRequest.REJECT) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-outline-success mx-2',
          cancelButton: 'btn btn-outline-danger'
        },
        buttonsStyling: false
      });

      swalWithBootstrapButtons.fire({
        title: 'Motivo',
        input: 'textarea',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        showCloseButton: true,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Motivo obligatorio'
          }
        }
      }).then((result) => {
        if (result.value) {
          update.Observation = result.value;
          this.requestProvider.updateFileStatus(
            this.request._id,
            update
          ).subscribe(result => {
            this.notificationService.showNotification(eNotificationType.SUCCESS, 'Documento rechazado', '');
            this.request = result.request;
            this.refresh();
          }, error => {
            this.notificationService.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
          });
        }
      });
    }
    else {
      this.requestProvider.updateFileStatus(
        this.request._id,
        update
      ).subscribe(result => {
        this.notificationService.showNotification(eNotificationType.SUCCESS, 'Documento aceptado', '');
        this.request = result.request;
        this.refresh();
      }, error => {
        this.notificationService.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
      });

    }


  }
}

interface IDocument {
  type?: string,
  dateRegistered?: Date,
  status?: string,
  file?: any,
  view?: string,
  action?: string,
  icon?: string
}