import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilisateurAdmin } from '../../code/models/utilisateur-admin.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagement {
  private base = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UtilisateurAdmin[]> {
    return this.http.get<UtilisateurAdmin[]>(this.base);
  }

  getUser(id: string): Observable<UtilisateurAdmin> {
    return this.http.get<UtilisateurAdmin>(`${this.base}/${id}`);
  }

  createUser(user: Partial<UtilisateurAdmin>): Observable<UtilisateurAdmin> {
    const newUser = {
      ...user,
      dateCreated: new Date().toISOString(),
      dernierLogin: null,
      isActive: true
    };
    return this.http.post<UtilisateurAdmin>(this.base, newUser);
  }

  updateUser(user: UtilisateurAdmin): Observable<UtilisateurAdmin> {
    return this.http.put<UtilisateurAdmin>(`${this.base}/${user.id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleUserStatus(user: UtilisateurAdmin): Observable<UtilisateurAdmin> {
    const updated = { ...user, isActive: !user.isActive };
    return this.updateUser(updated);
  }
}
