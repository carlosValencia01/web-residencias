import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { iPermission } from 'src/app/entities/app/permissions.model';
import { iRole } from 'src/app/entities/app/role.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { PermissionProvider } from 'src/app/providers/app/permission.prov';
import { RoleProvider } from 'src/app/providers/app/role.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles-admin',
  templateUrl: './roles-admin.component.html',
  styleUrls: ['./roles-admin.component.scss']
})
export class RolesAdminComponent implements OnInit {
  public roleForm: FormGroup;
  public roles: iRole[];
  public permissions: iPermission[];
  public titleCardForm: string;
  public searchText: string;
  public showFormPanel = false;
  public isViewDetails = false;
  private rolesCopy: iRole[];
  private currentRole: iRole;
  private isEditing = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private cookiesServ: CookiesService,
    private notificationServ: NotificationsServices,
    private permissionProv: PermissionProvider,
    private roleProv: RoleProvider,
    private router: Router,
    private loadingService: LoadingService,
  ) {
    if (!this.cookiesServ.isAllowed(this.activateRoute.snapshot.url.map(({ path }) => path).join('/'))) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this._initialize();
    });
  }

  public newRole() {
    this.titleCardForm = 'Nuevo rol';
    this._openFormPanel(null, true);
  }

  public searchRole() {
    const search = (this.searchText || '').toLowerCase();
    this.roles = this.rolesCopy
      .filter(role => (role.name || '').toLowerCase().includes(search));
  }

  public viewRole(role: iRole) {
    this.titleCardForm = 'Detalles del rol';
    this._openFormPanel(role, false);
    this.isViewDetails = true;
  }

  public editRole(role: iRole) {
    this.titleCardForm = 'Editar rol';
    this._openFormPanel(role, true);
    this.isEditing = true;
  }

  public removeRole(role: iRole) {
    Swal.fire({
      title: 'Ésta acción no se podrá revertir',
      text: `El rol ${role.name} se borrará totalmente. ¿Desea continuar?`,
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
        this.loadingService.setLoading(true);
        const isDeleted = await this._removeRole(role);
        this.loadingService.setLoading(false);
        if (isDeleted) {
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Roles', 'Rol eliminado con éxito');
          this._removeLocalRole(role);
          if (this.isEditing && this.currentRole && this.currentRole._id === role._id) {
            this.isEditing = false;
            this.titleCardForm = 'Nuevo rol';
            return;
          }
          this.closeFormPanel();
          return;
        }
        this.notificationServ
          .showNotification(eNotificationType.ERROR, 'Roles', 'Error, no se pudo eliminar el rol, verifique que no esté asignado');
      }
    });
  }

  public closeFormPanel() {
    this._closeFormPanel();
  }

  public async saveRole() {
    this.loadingService.setLoading(true);
    const role = this._getFormData();
    if (!role.permissions || (role.permissions && !role.permissions.length)) {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'Roles', 'Seleccione los permisos del rol');
      this.loadingService.setLoading(false);
      return;
    }
    if (this.isEditing) {
      this.currentRole = this._getNewCurrentRole(this.currentRole, role);
      const isUpdate = await this._updateRole(this.currentRole);
      this.loadingService.setLoading(false);
      if (isUpdate) {
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Roles', 'Rol actualizado con éxito');
        this._updateLocalRole(this.currentRole);
        return;
      }
      this.notificationServ
        .showNotification(eNotificationType.ERROR, 'Roles', 'Ocurrió un error, inténte de nuevo');
      return;
    }
    const index = this.rolesCopy.findIndex(({ name }) => name.toLowerCase() === role.name.toLowerCase());
    if (index !== -1) {
      Swal.fire('Roles', 'Ya existe un rol con el mismo nombre', 'error');
      this.loadingService.setLoading(false);
      return;
    }
    const _role = <iRole>(await this._createRole(role));
    this.loadingService.setLoading(false);
    if (_role) {
      this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Roles', 'Rol creado con éxito');
      this._addLocalRole(_role);
      this.newRole();
      return;
    }
    this.notificationServ
      .showNotification(eNotificationType.ERROR, 'Roles', 'Error, no se pudo crear el rol, inténte de nuevo');
  }

  public isAssignPermission(permissionId: string) {
    return this.currentRole && (<any[]>(this.currentRole.permissions)).includes(permissionId);
  }

  public changePermissionStatus(event: any, permissionId: string) {
    if (event.checked) {
      if (!this.currentRole) {
        this.currentRole = {
          name: '',
          description: '',
          permissions: []
        };
      }
      this.currentRole.permissions.push(permissionId);
      return;
    }
    const index = this.currentRole && this.currentRole.permissions.findIndex((_id) => _id === permissionId);
    if (index !== -1) {
      this.currentRole.permissions.splice(index, 1);
    }
  }

  private async _initialize() {
    this.loadingService.setLoading(true);
    this.roleForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required)
    });
    this.roles = <iRole[]>(await this._getAllRoles());
    this.permissions = (<any[]>(await this._getAllPermissions())).map(this._transformerPermission);
    this.rolesCopy = this.roles;
    this.searchRole();
    this.closeFormPanel();
    this.loadingService.setLoading(false);
  }

  private _fillForm(role: iRole) {
    this.roleForm.setValue({
      'name': (role && role.name) || '',
      'description': (role && role.description) || '',
    });
  }

  private _getFormData(): iRole {
    const name = (this.roleForm.get('name').value || '').trim();
    return {
      'name': name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      'description': (this.roleForm.get('description').value || '').trim(),
      'permissions': (this.currentRole && this.currentRole.permissions) || [],
    };
  }

  private _getAllRoles() {
    return new Promise((resolve) => {
      this.roleProv.getAllRoles()
        .subscribe((res) => resolve(res && res.role),
          (_) => resolve([]));
    });
  }

  private _openFormPanel(role: iRole, enableForm: boolean) {
    this.roleForm.reset();
    enableForm ? this.roleForm.enable() : this.roleForm.disable();
    this.currentRole = role;
    this._fillForm(role);
    this.showFormPanel = true;
    this.isEditing = false;
    this.isViewDetails = false;
  }

  private _closeFormPanel() {
    this.roleForm.reset();
    this.showFormPanel = false;
    this.isEditing = false;
    this.isViewDetails = false;
    this.currentRole = null;
  }

  private _getNewCurrentRole(currentRole: iRole, newRole: iRole): iRole {
    const role = newRole;
    role._id = currentRole._id;
    return role;
  }

  private _addLocalRole(role: iRole) {
    this.rolesCopy.push(role);
    this.searchRole();
  }

  private _removeLocalRole(role: iRole) {
    const index = this.rolesCopy.findIndex(($role) => $role._id === role._id);
    this.rolesCopy.splice(index, 1);
    this.searchRole();
  }

  private _updateLocalRole(role: iRole) {
    const index = this.rolesCopy.findIndex((_role) => _role._id === role._id);
    this.rolesCopy.splice(index, 1, role);
    this.searchRole();
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

  private _createRole(role: iRole) {
    return new Promise((resolve) => {
      this.roleProv.createRole(role)
        .subscribe((_role) => resolve(_role),
          (_) => resolve(null));
    });
  }

  private _updateRole(role: iRole) {
    return new Promise((resolve) => {
      this.roleProv.updateRole(role._id, role)
        .subscribe((_) => resolve(true),
          (_) => resolve(false));
    });
  }

  private _removeRole(role: iRole) {
    return new Promise((resolve) => {
      this.roleProv.removeRole(role._id)
        .subscribe((_) => resolve(true),
          (_) => resolve(false));
    });
  }

  private _getAllPermissions() {
    return new Promise((resolve) => {
      this.permissionProv.getAllPermissionsByCategories()
        .subscribe((res) => resolve(res && res.permissions),
          (_) => resolve([]));
    });
  }

}
