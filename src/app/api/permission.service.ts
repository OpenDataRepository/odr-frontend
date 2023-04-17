import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from '../auth.service';
import { of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private api: ApiService, private auth: AuthService) { }

  hasPermission(uuid: string, permission_level: string) {
    return this.auth.userIsAuthenticated.pipe(
      take(1),
      switchMap(result => {
        if(!result) {
          return of(false);
        }
        return this.api.currentUserHasPermission(uuid, permission_level);
      })
    )
  }
}
