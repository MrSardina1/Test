import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '../../code/services/auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.auth.getUser();
    if (user && (user.role === 'admin' || user.role === 'super_admin')) return true;
    return this.router.createUrlTree(['/login']);
  }
}
