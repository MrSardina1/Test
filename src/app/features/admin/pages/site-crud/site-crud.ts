import { Component, OnInit } from '@angular/core';
import { Site } from '../../../../core/services/site';
import { Router, RouterLink } from '@angular/router';
import { SiteH } from '../../../../code/models/siteH.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-crud',
  templateUrl: './site-crud.html',
  imports: [RouterLink, FormsModule, CommonModule],
  styleUrls: ['./site-crud.css']
})
export class SiteCrudComponent implements OnInit {
  sites: SiteH[] = [];
  showForm = false;
  editingId: string | null = null;
  searchTerm = '';
  filterCategory = '';

  formData = {
    nom: '',
    localisation: '',
    photo: '',
    dateConstruction: '',
    estClasse: false,
    prixEntree: 0,
    description: '',
    categorie: 'Autre',
    horaires: '',
    visitesGuideesDisponibles: false,
    lieuxProches: '',
    latitude: 0,
    longitude: 0
  };

  constructor(private siteService: Site, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.siteService.getSites().subscribe(s => this.sites = s);
  }

  filteredSites(): SiteH[] {
    return this.sites.filter(s => {
      const matchesSearch = !this.searchTerm ||
        s.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.localisation.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.filterCategory || s.categorie === this.filterCategory;
      return matchesSearch && matchesCategory;
    });
  }

  getClassifiedCount(): number {
    return this.sites.filter(s => s.estClasse).length;
  }

  getFreeCount(): number {
    return this.sites.filter(s => s.prixEntree === 0).length;
  }

  truncate(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  getCategoryClass(category: string): string {
    const map: { [key: string]: string } = {
      'Médina': 'medina',
      'Monument': 'monument',
      'Musée': 'musee',
      'Site Archéologique': 'archeologique',
      'Religieux': 'religieux',
      'Autre': 'autre'
    };
    return map[category] || 'autre';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default.jpg';
  }

  openAddForm() {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(site: SiteH) {
    this.editingId = site.id;
    this.formData = {
      nom: site.nom,
      localisation: site.localisation,
      photo: site.photo,
      dateConstruction: site.dateConstruction,
      estClasse: site.estClasse,
      prixEntree: site.prixEntree,
      description: site.description,
      categorie: site.categorie,
      horaires: (site.horaires || []).join(', '),
      visitesGuideesDisponibles: site.visitesGuideesDisponibles,
      lieuxProches: (site.lieuxProches || []).map(l => `${l.nom}|${l.type}|${l.distanceKm || 0}`).join('; '),
      latitude: site.latitude || 0,
      longitude: site.longitude || 0
    };
    this.showForm = true;
  }

  resetForm() {
    this.formData = {
      nom: '',
      localisation: '',
      photo: '',
      dateConstruction: '',
      estClasse: false,
      prixEntree: 0,
      description: '',
      categorie: 'Autre',
      horaires: '',
      visitesGuideesDisponibles: false,
      lieuxProches: '',
      latitude: 0,
      longitude: 0
    };
  }

  saveSite() {
    if (!this.formData.nom || !this.formData.localisation) {
      alert('Name and Location are required');
      return;
    }

    const horaires = this.formData.horaires.split(',').map(h => h.trim()).filter(h => h);
    const lieuxProches = this.formData.lieuxProches
      .split(';')
      .map(l => {
        const parts = l.trim().split('|');
        return {
          nom: parts[0] || '',
          type: parts[1] || '',
          distanceKm: parseFloat(parts[2]) || 0
        };
      })
      .filter(l => l.nom);

    if (this.editingId) {
      const original = this.sites.find(s => s.id === this.editingId);
      if (original) {
        const updated: SiteH = {
          ...original,
          nom: this.formData.nom,
          localisation: this.formData.localisation,
          photo: this.formData.photo,
          dateConstruction: this.formData.dateConstruction,
          estClasse: this.formData.estClasse,
          prixEntree: this.formData.prixEntree,
          description: this.formData.description,
          categorie: this.formData.categorie,
          horaires,
          visitesGuideesDisponibles: this.formData.visitesGuideesDisponibles,
          lieuxProches,
          latitude: this.formData.latitude,
          longitude: this.formData.longitude
        };
        this.siteService.updateSite(updated).subscribe(() => {
          alert('Site updated successfully');
          this.load();
          this.showForm = false;
        });
      }
    } else {
      const newSite: Partial<SiteH> = {
        nom: this.formData.nom,
        localisation: this.formData.localisation,
        photo: this.formData.photo,
        dateConstruction: this.formData.dateConstruction || new Date().toISOString(),
        estClasse: this.formData.estClasse,
        prixEntree: this.formData.prixEntree,
        description: this.formData.description,
        categorie: this.formData.categorie,
        horaires,
        visitesGuideesDisponibles: this.formData.visitesGuideesDisponibles,
        lieuxProches,
        latitude: this.formData.latitude,
        longitude: this.formData.longitude,
        comments: []
      };
      this.siteService.createSite(newSite).subscribe(() => {
        alert('Site created successfully');
        this.load();
        this.showForm = false;
      });
    }
  }

  cancelForm() {
    this.showForm = false;
  }

  delete(id: string) {
    if (!confirm('Are you sure you want to delete this site?')) return;
    this.siteService.deleteSite(id).subscribe(() => {
      alert('Site deleted successfully');
      this.load();
    });
  }
}
