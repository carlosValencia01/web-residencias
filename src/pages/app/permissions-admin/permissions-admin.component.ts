import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { iPermission } from 'src/entities/app/permissions.model';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { PermissionProvider } from 'src/providers/app/permission.prov';

@Component({
  selector: 'app-permissions-admin',
  templateUrl: './permissions-admin.component.html',
  styleUrls: ['./permissions-admin.component.scss']
})
export class PermissionsAdminComponent implements OnInit {
  public permissionForm: FormGroup;
  public permissions: iPermission[];
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public showLoading = false;
  public isViewDetails = false;
  private permissionsCopy: iPermission[];
  private currentPermission: iPermission;
  private isEditing = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private cookiesServ: CookiesService,
    private notificationServ: NotificationsServices,
    private permissionProv: PermissionProvider,
    private router: Router,
  ) {
    if (!this.cookiesServ.isAllowed(this.activateRoute.snapshot.url.map(({ path }) => path).join('/'))) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this._initialize();
  }

  public newPermission() {
    this.titleCardForm = 'Nuevo permiso';
    this._openFormPanel(null, true);
  }

  public searchPermission() {
    const search = (this.searchText || '').toLowerCase();
    this.permissions = this.permissionsCopy
      .filter(permission => (permission.label || '').toLowerCase().includes(search));
  }

  public viewPermission(permission: iPermission) {
    this.titleCardForm = 'Detalles del permiso';
    this._openFormPanel(permission, false);
    this.isViewDetails = true;
  }

  public editPermission(permission: iPermission) {
    this.titleCardForm = 'Editar permiso';
    this._openFormPanel(permission, true);
    this.isEditing = true;
  }

  public removePermission(permission: iPermission) {
    Swal.fire({
      title: 'Ésta acción no se podrá revertir',
      text: `El permiso ${permission.label} se borrará totalmente. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then(async (result) => {
      if (result.value) {
        this.showLoading = true;
        const isDeleted = await this._removePermission(permission);
        this.showLoading = false;
        if (isDeleted) {
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Permisos', 'Permiso eliminado con éxito');
          this._removeLocalPermission(permission);
          if (this.isEditing && this.currentPermission && this.currentPermission._id === permission._id) {
            this.isEditing = false;
            this.titleCardForm = 'Nuevo permiso';
            return;
          }
          this.closeFormPanel();
          return;
        }
        this.notificationServ
          .showNotification(eNotificationType.ERROR, 'Permisos', 'Error, no se pudo eliminar el permiso, verifique que no esté asignado');
      }
    });
  }

  public closeFormPanel() {
    this._closeFormPanel();
  }

  public async savePermission() {
    this.showLoading = true;
    const permission = this._getFormData();
    if (this.isEditing) {
      this.currentPermission = this._getNewCurrentPermission(this.currentPermission, permission);
      const isUpdate = await this._updatePermission(this.currentPermission);
      this.showLoading = false;
      if (isUpdate) {
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Permisos', 'Permiso actualizado con éxito');
        this._updateLocalPermission(this.currentPermission);
        return;
      }
      this.notificationServ
        .showNotification(eNotificationType.ERROR, 'Permisos', 'Ocurrió un error, inténte de nuevo');
      return;
    }
    const index = this.permissionsCopy.findIndex(({ label }) => label.toLowerCase() === permission.label.toLowerCase());
    if (index !== -1) {
      Swal.fire('Permisos', 'Ya existe un permiso con el mismo nombre', 'error');
      this.showLoading = false;
      return;
    }
    const _permission = <iPermission>(await this._createPermission(permission));
    this.showLoading = false;
    if (_permission) {
      this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Permisos', 'Permiso creado con éxito');
      this._addLocalPermission(_permission);
      this.newPermission();
      return;
    }
    this.notificationServ
      .showNotification(eNotificationType.ERROR, 'Permisos', 'Error, no se pudo crear el permiso, inténte de nuevo');
  }

  public viewIcons() {
    window.open('https://material.io/resources/icons/?style=baseline', '_blank');
  }

  private async _initialize() {
    this.showLoading = true;
    this.permissionForm = new FormGroup({
      'label': new FormControl(null, Validators.required),
      'category': new FormControl(null, Validators.required),
      'routerLink': new FormControl(null, Validators.required),
      'icon': new FormControl(null, Validators.required)
    });
    this.permissions = <iPermission[]>(await this._getAllPermissions());
    this.permissions = (<any[]>(await this._getAllPermissions())).map(this._transformerPermission);
    this.permissionsCopy = this.permissions;
    this.searchPermission();
    this.closeFormPanel();
    this.showLoading = false;
  }

  private _fillForm(permission: iPermission) {
    this.permissionForm.setValue({
      'label': (permission && permission.label) || '',
      'category': (permission && permission.category) || '',
      'routerLink': (permission && permission.routerLink) || '',
      'icon': (permission && permission.icon) || '',
    });
  }

  private _getFormData(): iPermission {
    const label = (this.permissionForm.get('label').value || '').trim();
    const category = (this.permissionForm.get('category').value || '').trim();
    return {
      'label': this._getCappitalizeText(label),
      'category': this._getCappitalizeText(category),
      'routerLink': (this.permissionForm.get('routerLink').value || '').trim(),
      'icon': (this.permissionForm.get('icon').value || '').trim().toLowerCase(),
    };
  }

  private _getCappitalizeText(text: string): string {
    return text && text.charAt(0).toLocaleUpperCase() + text.slice(1).toLocaleLowerCase();
  }

  private _getAllPermissions() {
    return new Promise((resolve) => {
      this.permissionProv.getAllPermissions()
        .subscribe((res) => resolve(res && res.permissions),
          (_) => resolve([]));
    });
  }

  private _openFormPanel(permission: iPermission, enableForm: boolean) {
    this.permissionForm.reset();
    enableForm ? this.permissionForm.enable() : this.permissionForm.disable();
    this.currentPermission = permission;
    this._fillForm(permission);
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  private _closeFormPanel() {
    this.permissionForm.reset();
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
    this.currentPermission = null;
  }

  private _getNewCurrentPermission(currentPermission: iPermission, newPermission: iPermission): iPermission {
    const permission = newPermission;
    permission._id = currentPermission._id;
    return permission;
  }

  private _addLocalPermission(permission: iPermission) {
    this.permissionsCopy.push(permission);
    this.searchPermission();
  }

  private _removeLocalPermission(permission: iPermission) {
    const index = this.permissionsCopy.findIndex(($permission) => $permission._id === permission._id);
    this.permissionsCopy.splice(index, 1);
    this.searchPermission();
  }

  private _updateLocalPermission(permission: iPermission) {
    const index = this.permissionsCopy.findIndex((_permission) => _permission._id === permission._id);
    this.permissionsCopy.splice(index, 1, permission);
    this.searchPermission();
    if (this.isEditing || this.isViewDetails) {
      this.closeFormPanel();
    }
  }

  private _transformerPermission(item: any): iPermission {
    return {
      category: item.category || '',
      items: <iPermission[]>item.permissions || [],
      _id: item._id || null,
      icon: item.icon || null,
      label: item.label || null,
      routerLink: item.routerLink || null
    };
  }

  private _createPermission(permission: iPermission) {
    return new Promise((resolve) => {
      this.permissionProv.createPermission(permission)
        .subscribe((_permission) => resolve(_permission),
          (_) => resolve(null));
    });
  }

  private _updatePermission(permission: iPermission) {
    return new Promise((resolve) => {
      this.permissionProv.updatePermission(permission._id, permission)
        .subscribe((_) => resolve(true),
          (_) => resolve(false));
    });
  }

  private _removePermission(permission: iPermission) {
    return new Promise((resolve) => {
      this.permissionProv.removePermission(permission._id)
        .subscribe((_) => resolve(true),
          (_) => resolve(false));
    });
  }

}
