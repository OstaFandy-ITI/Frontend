// components/client-edit-modal/client-edit-modal.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../services/client.service';
import { AdminDisplayClientDTO, AdminEditClientDTO } from '../../../../core/models/client.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-edit-modal',
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
  })
export class ClientEditModalComponent implements OnChanges {
  @Input() client: AdminDisplayClientDTO | null = null;
  @Input() modalId: string = 'clientEditModal';
  @Output() clientUpdated = new EventEmitter<void>();

  editForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private toastr: ToastrService
  ) {
    this.editForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client) {
      this.populateForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/), Validators.maxLength(20)]],
      isActive: [true],
      defaultAddressId: [null]
    });
  }

  private populateForm(): void {
    if (this.client) {
      this.editForm.patchValue({
        id: this.client.id,
        firstName: this.client.firstName,
        lastName: this.client.lastName,
        email: this.client.email,
        phone: this.client.phone,
        isActive: this.client.isActive,
        defaultAddressId: this.client.defaultAddressId
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formData: AdminEditClientDTO = this.editForm.value;
      
      this.clientService.updateClient(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.clientUpdated.emit();
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating client:', error);
          
          if (error.error && error.error.message) {
            this.toastr.error(error.error.message, 'Update Failed');
          } else {
            this.toastr.error('Failed to update client. Please try again.', 'Update Failed');
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private resetForm(): void {
    this.editForm.reset();
    this.isSubmitting = false;
  }

  onCancel(): void {
    this.resetForm();
    if (this.client) {
      this.populateForm();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      isActive: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  get availableAddresses() {
    return this.client?.addresses || [];
  }
}