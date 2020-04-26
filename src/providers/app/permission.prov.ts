import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/providers/app/api.prov';
import { iPermission } from 'src/entities/app/permissions.model';

@Injectable()
export class PermissionProvider {
  constructor(
    private api: Api,
  ) { }

  public getAllPermissions() {
    return this.api.get('permission')
      .pipe(map(res => res.json()));
  }

  public getAllPermissionsByCategories() {
    return this.api.get('permission/byCategories')
      .pipe(map(res => res.json()));
  }

  public createPermission(permission: iPermission) {
    return this.api.post('permission', permission)
      .pipe(map(res => res.json()));
  }

  public updatePermission(permissionId: string, newPermission: iPermission) {
    return this.api.put(`permission/${permissionId}`, newPermission)
      .pipe(map(res => res.json()));
  }

  public removePermission(permissionId: string) {
    return this.api.delete(`permission/${permissionId}`)
      .pipe(map(res => res.json()));
  }

}
