// components/client-detail-modal/client-detail-modal.component.ts
import { Component, Input } from '@angular/core';
import { AdminDisplayClientDTO } from '../../../core/models/client.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-detail-modal',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css'],
  imports: [CommonModule]
})
export class ClientDetailModalComponent {
  @Input() client: AdminDisplayClientDTO | null = null;
  @Input() modalId: string = 'clientDetailModal';

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}