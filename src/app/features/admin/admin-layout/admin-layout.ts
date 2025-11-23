import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from "@angular/router";
import { Auth } from '../../../code/services/auth';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  constructor(private auth: Auth, private router: Router) {}

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}
