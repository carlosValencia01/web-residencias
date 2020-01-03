import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';

import {CookiesService} from 'src/services/app/cookie.service';
import {DocumentProvider} from 'src/providers/shared/document.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {IDocument} from 'src/entities/shared/document.model';
import {NotificationsServices} from 'src/services/app/notifications.service';

@Component({
  selector: 'app-documents-admin-page',
  templateUrl: './documents-admin-page.component.html',
  styleUrls: ['./documents-admin-page.component.scss']
})
export class DocumentsAdminPageComponent implements OnInit {
  public documentForm: FormGroup;
  public documents: Array<IDocument>;
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public isViewDetails = false;
  private documentsCopy: Array<IDocument>;
  private currentDocument: IDocument;
  private isEditing = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private documentProv: DocumentProvider,
    private notificationsService: NotificationsServices,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this._initializeForm();
    this._getAllDocuments();
  }

  public searchDocuments() {
    const search = (this.searchText || '').toLowerCase();
    this.documents = this.documentsCopy
      .filter(doc => JSON.stringify(doc).toLowerCase().includes(search));
  }

  public saveDocument() {
    const document = this._getFormData();
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
            this._updateDocument(this.currentDocument);
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
            this._addDocument(created);
          } else {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              created.error.includes('MongoError: E11000 duplicate key') ?
                'Error, el código del documento ingresado ya existe, ingrese uno nuevo' :
                'Ocurrió un error al crear el documento', 'Intente de nuevo');
          }
        });
    }
  }

  public newDocument() {
    this.titleCardForm = 'Creando documento';
    this.documentForm.enable();
    this.documentForm.reset();
    this.currentDocument = null;
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  public viewDocument(document) {
    this.titleCardForm = 'Detalles del documento';
    this.documentForm.markAsUntouched();
    this.documentForm.disable();
    this.isViewDetails = true;
    this._fillForm(document);
    this.showFormPanel = true;
    this.isEditing = false;
    this.currentDocument = null;
  }

  public editDocument(document) {
    this.titleCardForm = 'Actualizando documento';
    this.currentDocument = document;
    this.documentForm.enable();
    this._fillForm(document);
    this.showFormPanel = true;
    this.isEditing = true;
    this.isViewDetails = false;
  }

  public removeDocument(document) {
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
              if (this.isEditing && this.currentDocument._id === document._id) {
                this.isEditing = false;
                this.titleCardForm = 'Creando documento';
              }
              this._removeDocument(document);
            } else {
              this.notificationsService.showNotification(eNotificationType.ERROR, 'Error al borrar documento', deleted.error);
            }
          });
      }
    });
  }

  public closeFormPanel() {
    this.documentForm.reset();
    this.currentDocument = null;
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  private _getAllDocuments() {
    this.documentProv.getAllDocuments()
      .subscribe(docs => {
        this.documents = docs;
        this.documentsCopy = this.documents;
        if (this.searchText) {
          this.searchDocuments();
        }
      });
  }

  private _initializeForm() {
    this.documentForm = new FormGroup({
      'strategicProcess': new FormControl(null, Validators.required),
      'key': new FormControl(null, Validators.required),
      'code': new FormControl(null, Validators.required),
      'operativeProcess': new FormControl(null, Validators.required),
      'procedure': new FormControl(null, Validators.required),
      'name': new FormControl(null, Validators.required),
    });
  }

  private _getFormData() {
    return {
      strategicProcess: this.documentForm.get('strategicProcess').value,
      key: this.documentForm.get('key').value,
      code: this.documentForm.get('code').value,
      operativeProcess: this.documentForm.get('operativeProcess').value,
      procedure: this.documentForm.get('procedure').value,
      name: this.documentForm.get('name').value,
    };
  }

  private _fillForm(document) {
    this.documentForm.setValue({
      'strategicProcess': document.strategicProcess,
      'key': document.key,
      'code': document.code,
      'operativeProcess': document.operativeProcess,
      'procedure': document.procedure,
      'name': document.name,
    });
  }

  private _addDocument(document: IDocument) {
    document.departments = [];
    this.documentsCopy.push(document);
    this.searchDocuments();
  }

  private _removeDocument(document: IDocument) {
    const index = this.documentsCopy.findIndex(depto => depto._id === document._id);
    this.documentsCopy.splice(index, 1);
    this.searchDocuments();
    if (this.isViewDetails) {
      this.closeFormPanel();
    }
  }

  private _updateDocument(document: IDocument) {
    const index = this.documentsCopy.findIndex(depto => depto._id === document._id);
    this.documentsCopy.splice(index, 1, document);
    this.searchDocuments();
    if (this.isEditing || this.isViewDetails) {
      this.closeFormPanel();
    }
  }
}
