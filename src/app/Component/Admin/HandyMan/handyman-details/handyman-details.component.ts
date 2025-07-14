import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminHandyManDTO } from '../../../../core/models/Adminhandyman.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-handyman-details',
  templateUrl: './handyman-details.component.html',
  styleUrls: ['./handyman-details.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class HandymanDetailsComponent {
  @Input() handyman!: AdminHandyManDTO;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  
  activeTab = 'personal';

  onClose(): void {
    this.close.emit();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  // Statistics methods
  getTotalBookings(): number {
    return this.handyman?.jobAssignments?.length || 0;
  }

  getActiveBookings(): number {
    if (!this.handyman?.jobAssignments) {
      return 0;
    }
    return this.handyman.jobAssignments.filter(job => job.isActive).length;
  }

  getTotalSpent(): string {
    if (!this.handyman?.jobAssignments) {
      return '0.00';
    }
    const fixedRatePerJob = 50; 
    const total = this.handyman.jobAssignments.length * fixedRatePerJob;

    return total.toFixed(2);
  }
}