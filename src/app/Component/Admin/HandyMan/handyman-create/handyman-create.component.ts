import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HandymanService } from '../../services/handyman.service';
import { CreateHandymanDTO, AdminHandyManDTO } from '../../../../core/models/Adminhandyman.model';

@Component({
  selector: 'app-handyman-create',
  templateUrl: './handyman-create.component.html',
  styleUrls: ['./handyman-create.component.css']
})
export class HandymanCreateComponent {
  @Output() created = new EventEmitter<AdminHandyManDTO>();
  @Output() cancelled = new EventEmitter<void>();

  createForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private handymanService: HandymanService
  ) {
    this.initializeForm();
  }

  initializeForm(): void {
    this.createForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      specializationId: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      nationalId: ['', Validators.required],
      nationalIdImg: [''],
      img: [''],
      experienceYears: ['', [Validators.required, Validators.min(0)]],
      status: ['Pending'],
      defaultAddressPlace: [''],
      addressType: ['Home'],
      defaultAddressCity: [''],
      defaultAddressLatitude: [''],
      defaultAddressLongitude: ['']
    });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      this.loading = true;
      const createData: CreateHandymanDTO = this.createForm.value;
      
      this.handymanService.createHandyman(createData).subscribe({
        next: (newHandyman) => {
          this.loading = false;
          this.created.emit(newHandyman);
          this.createForm.reset();
        },
        error: (error) => {
          console.error('Error creating handyman:', error);
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.createForm.reset();
  }
}