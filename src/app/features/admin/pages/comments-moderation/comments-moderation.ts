import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Site } from '../../../../core/services/site';
import { SiteH } from '../../../../code/models/siteH.model';
import { Commentaire } from '../../../../code/models/commentaire.model';

interface CommentWithSite {
  comment: Commentaire;
  siteId: string;
  siteName: string;
}

@Component({
  selector: 'app-comments-moderation',
  templateUrl: './comments-moderation.html',
  imports: [DatePipe, CommonModule, FormsModule],
  styleUrls: ['./comments-moderation.css']
})
export class CommentsModerationComponent implements OnInit {
  allComments: CommentWithSite[] = [];
  sites: SiteH[] = [];
  selectedSiteId: string = '';
  selectedStatus: string = '';

  constructor(private siteService: Site) {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.siteService.getSites().subscribe(sites => {
      this.sites = sites;
      this.allComments = [];

      sites.forEach(site => {
        (site.comments || []).forEach(comment => {
          this.allComments.push({
            comment,
            siteId: site.id,
            siteName: site.nom
          });
        });
      });
    });
  }

  filteredComments(): CommentWithSite[] {
    return this.allComments.filter(item => {
      const matchSite = !this.selectedSiteId || item.siteId === this.selectedSiteId;

      let matchStatus = true;
      if (this.selectedStatus === 'approved') {
        matchStatus = item.comment.approved === true;
      } else if (this.selectedStatus === 'rejected') {
        matchStatus = item.comment.approved === false;
      } else if (this.selectedStatus === 'pending') {
        matchStatus = item.comment.approved === undefined;
      }

      return matchSite && matchStatus;
    });
  }

  getTotalComments(): number {
    return this.allComments.length;
  }

  getApprovedCount(): number {
    return this.allComments.filter(c => c.comment.approved === true).length;
  }

  getRejectedCount(): number {
    return this.allComments.filter(c => c.comment.approved === false).length;
  }

  getPendingCount(): number {
    return this.allComments.filter(c => c.comment.approved === undefined).length;
  }

  getCommentsCountForSite(siteId: string): number {
    return this.allComments.filter(c => c.siteId === siteId).length;
  }

  approve(item: CommentWithSite) {
    item.comment.approved = true;

    const site = this.sites.find(s => s.id === item.siteId);
    if (site) {
      this.siteService.updateSite(site).subscribe(() => {
        this.loadComments();
      });
    }
  }

  reject(item: CommentWithSite) {
    item.comment.approved = false;

    const site = this.sites.find(s => s.id === item.siteId);
    if (site) {
      this.siteService.updateSite(site).subscribe(() => {
        this.loadComments();
      });
    }
  }

  delete(item: CommentWithSite) {
    if (!confirm('Supprimer ce commentaire ?')) return;

    this.siteService.deleteComment(item.siteId, item.comment.id).subscribe(() => {
      this.loadComments();
    });
  }

  getStatusBadge(approved: boolean | undefined): string {
    if (approved === true) return 'Approved';
    if (approved === false) return 'Rejected';
    return 'Pending';
  }

  getStatusClass(approved: boolean | undefined): string {
    if (approved === true) return 'badge-success';
    if (approved === false) return 'badge-danger';
    return 'badge-warning';
  }
}
