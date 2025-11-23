import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagement } from '../../../../core/services/user-management.service';
import { UtilisateurAdmin } from '../../../../code/models/utilisateur-admin.model';
import { Auth } from '../../../../code/services/auth';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  users: UtilisateurAdmin[] = [];
  filteredUsers: UtilisateurAdmin[] = [];
  showForm = false;
  editingId: string | null = null;
  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  formData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: 'super_admin' | 'moderator' | 'editor';
    avatar: string;
    phone: string;
  } = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'editor',
    avatar: '',
    phone: ''
  };

  constructor(
    private userManagement: UserManagement,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userManagement.getAllUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchSearch = !this.searchTerm ||
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchRole = !this.filterRole || user.role === this.filterRole;

      let matchStatus = true;
      if (this.filterStatus === 'active') {
        matchStatus = user.isActive === true;
      } else if (this.filterStatus === 'inactive') {
        matchStatus = user.isActive === false;
      }

      return matchSearch && matchRole && matchStatus;
    });
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getActiveUsers(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getInactiveUsers(): number {
    return this.users.filter(u => !u.isActive).length;
  }

  getUsersByRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  openAddForm() {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(user: UtilisateurAdmin) {
    this.editingId = user.id;
    this.formData = {
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.role as 'super_admin' | 'moderator' | 'editor',
      avatar: user.avatar || '',
      phone: user.phone || ''
    };
    this.showForm = true;
  }

  resetForm() {
    this.formData = {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'editor',
      avatar: '',
      phone: ''
    };
  }

  saveUser() {
    if (!this.formData.username || !this.formData.email || !this.formData.fullName) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.editingId) {
      this.userManagement.getUser(this.editingId).subscribe(original => {
        const updated: UtilisateurAdmin = {
          ...original,
          username: this.formData.username,
          email: this.formData.email,
          fullName: this.formData.fullName,
          role: this.formData.role,
          avatar: this.formData.avatar,
          phone: this.formData.phone
        };

        if (this.formData.password) {
          updated.password = this.formData.password;
        }

        this.userManagement.updateUser(updated).subscribe(() => {
          alert('Utilisateur mis à jour avec succès');
          this.loadUsers();
          this.showForm = false;
        });
      });
    } else {
      if (!this.formData.password) {
        alert('Le mot de passe est obligatoire pour un nouvel utilisateur');
        return;
      }

      const newUser: Partial<UtilisateurAdmin> = {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password,
        fullName: this.formData.fullName,
        role: this.formData.role,
        avatar: this.formData.avatar || `https://i.pravatar.cc/150?u=${this.formData.username}`,
        phone: this.formData.phone
      };

      this.userManagement.createUser(newUser).subscribe(() => {
        alert('Utilisateur créé avec succès');
        this.loadUsers();
        this.showForm = false;
      });
    }
  }

  cancelForm() {
    this.showForm = false;
  }

  deleteUser(id: string) {
    const currentUser = this.auth.getUser();
    if (currentUser?.id === id) {
      alert('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    this.userManagement.deleteUser(id).subscribe(() => {
      alert('Utilisateur supprimé avec succès');
      this.loadUsers();
    });
  }

  toggleStatus(user: UtilisateurAdmin) {
    const currentUser = this.auth.getUser();
    if (currentUser?.id === user.id) {
      alert('Vous ne pouvez pas désactiver votre propre compte');
      return;
    }

    this.userManagement.toggleUserStatus(user).subscribe(() => {
      this.loadUsers();
    });
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'super_admin': 'role-super-admin',
      'moderator': 'role-moderator',
      'editor': 'role-editor'
    };
    return classes[role] || 'role-editor';
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'moderator': 'Modérateur',
      'editor': 'Éditeur'
    };
    return labels[role] || role;
  }

  getTimeSinceLogin(date: string | null): string {
    if (!date) return 'Jamais connecté';

    const now = new Date();
    const loginDate = new Date(date);
    const diff = now.getTime() - loginDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return 'Récemment';
  }
}
