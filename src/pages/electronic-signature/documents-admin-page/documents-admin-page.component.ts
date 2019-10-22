import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookiesService } from 'src/services/app/cookie.service';
import { DocumentProvider } from 'src/providers/shared/document.prov';
import { IDocument } from 'src/entities/shared/document.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documents-admin-page',
  templateUrl: './documents-admin-page.component.html',
  styleUrls: ['./documents-admin-page.component.scss']
})
export class DocumentsAdminPageComponent implements OnInit {
  public documentForm: FormGroup;
  public documents: Array<IDocument>;
  private documentsCopy: Array<IDocument>;
  private currentDocument: IDocument;
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public isEditing = false;
  public isViewDetails = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private documentProv: DocumentProvider,
    private notificationsService: NotificationsServices,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.initializeForm();
    this.getAllDocuments();
  }

  getAllDocuments() {
    this.documentProv.getAllDocuments()
      .subscribe(docs => {
        this.documents = docs;
        this.documentsCopy = this.documents;
        if (this.searchText) {
          this.searchDocuments();
        }
      });
  }

  searchDocuments() {
    this.documents = this.documentsCopy
      .filter(doc => JSON.stringify(doc).includes(this.searchText));
  }

  initializeForm() {
    this.documentForm = new FormGroup({
      'strategicProcess': new FormControl(null, Validators.required),
      'key': new FormControl(null, Validators.required),
      'code': new FormControl(null, Validators.required),
      'operativeProcess': new FormControl(null, Validators.required),
      'procedure': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
    });
  }

  saveDocument() {
    const document = this.getFormData();
    if (this.isEditing) {
      this.currentDocument.strategicProcess = document.strategicProcess;
      this.currentDocument.key = document.key;
      this.currentDocument.code = document.code;
      this.currentDocument.operativeProcess = document.operativeProcess;
      this.currentDocument.procedure = document.procedure;
      this.currentDocument.name = document.name;
      this.documentProv.updateDocument(this.currentDocument)
        .subscribe(updated => {
          if (updated.status === 200) {
            this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Documento modificado correctamente', '');
            this.documentForm.reset();
            this.titleCardForm = 'Creando documento';
            this.currentDocument = null;
            this.isEditing = false;
          } else {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Error, no se pudo modificar el documento', 'Intente de nuevo');
          }
        });
    } else {
      this.documentProv.createDocument(document)
        .subscribe(created => {
          if (created && !created.status) {
            this.documentForm.reset();
            this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Documento creado con éxito', '');
          } else {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              created.error.includes('MongoError: E11000 duplicate key') ?
                'Error, el código del documento ingresado ya existe, ingrese uno nuevo' :
                'Ocurrió un error al crear el documento', 'Intente de nuevo');
          }
        });
    }
    this.getAllDocuments();
  }

  getFormData() {
    return {
      strategicProcess: this.documentForm.get('strategicProcess').value,
      key: this.documentForm.get('key').value,
      code: this.documentForm.get('code').value,
      operativeProcess: this.documentForm.get('operativeProcess').value,
      procedure: this.documentForm.get('procedure').value,
      name: this.documentForm.get('name').value,
    };
  }

  fillForm(document) {
    this.documentForm.setValue({
      'strategicProcess': document.strategicProcess,
      'key': document.key,
      'code': document.code,
      'operativeProcess': document.operativeProcess,
      'procedure': document.procedure,
      'name': document.name,
    });
  }

  newDocument() {
    this.titleCardForm = 'Creando documento';
    this.documentForm.enable();
    this.documentForm.reset();
    this.currentDocument = null;
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  viewDocument(document) {
    this.titleCardForm = 'Detalles del documento';
    this.documentForm.markAsUntouched();
    this.documentForm.disable();
    this.isViewDetails = true;
    this.fillForm(document);
    this.showFormPanel = true;
    this.isEditing = false;
    this.currentDocument = null;
  }

  editDocument(document) {
    this.titleCardForm = 'Actualizando documento';
    this.currentDocument = document;
    this.documentForm.enable();
    this.fillForm(document);
    this.showFormPanel = true;
    this.isEditing = true;
    this.isViewDetails = false;
  }

  removeDocument(document) {
    Swal.fire({
      title: 'Ésta acción no se puede revertir',
      text: `El documento ${document.name} se borrará totalmente. ¿Desea borrarlo?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.documentProv.removeDocument(document._id)
          .subscribe(deleted => {
            if (deleted.status === 200) {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Documento borrado con éxito', '');
              if (this.currentDocument._id === document._id) {
                this.isEditing = false;
                this.titleCardForm = 'Creando documento';
              }
              this.getAllDocuments();
            } else {
              this.notificationsService.showNotification(eNotificationType.ERROR, 'Error al borrar documento', deleted.error);
            }
          });
      }
    });
  }

  closeFormPanel() {
    this.documentForm.reset();
    this.currentDocument = null;
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
  }
}
