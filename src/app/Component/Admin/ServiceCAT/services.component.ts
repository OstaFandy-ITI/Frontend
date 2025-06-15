import {Component,OnInit,ViewChild,ElementRef} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceItem, ServiceService } from '../services/Service.service';
import { ServiceUpdateDTO } from '../services/Service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServiceComponent implements OnInit {

  services: ServiceItem[] = [];
  categories: { id: number; name: string }[] = [];

  selectedService?: ServiceItem;

  pageNumber = 1;
  pageSize = 5;
  totalItems = 0;

  searchTerm: string = '';
  filterStatus: string = 'All';
  filterCategoryId: number | null = null;

  sortField: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  addForm!: FormGroup;
  editForm!: FormGroup;
  @ViewChild('addCloseBtn') addCloseBtn!: ElementRef;
  @ViewChild('editCloseBtn') editCloseBtn!: ElementRef;
@ViewChild('statusCloseBtn') statusCloseBtn!: ElementRef;

  constructor(
    private serviceService: ServiceService,
    private fb: FormBuilder,
     private toastr: ToastrService


  ) {}

  ngOnInit(): void {
    this.getServices();
    this.loadCategories();
    this.initForms();
  }

  initForms(): void {
    this.addForm = this.fb.group({
      categoryId: [null, Validators.required],
      name: ['', Validators.required],
      description: [''],
      fixedPrice: [1, [Validators.required, Validators.min(1)]],
      estimatedMinutes: [1, [Validators.required, Validators.min(1)]],
      serviceType: ['Fixed', Validators.required],
      isActive: [true]
    });

    this.editForm = this.fb.group({
      id: [0],
      categoryId: [null, Validators.required],
      name: ['', Validators.required],
      description: [''],
      fixedPrice: [1, [Validators.required, Validators.min(1)]],
      estimatedMinutes: [1, [Validators.required, Validators.min(1)]],
      serviceType: ['Fixed', Validators.required]
      // no isActive in editForm (hidden)
    });
  }

  getServices(): void {
    this.serviceService
      .getPaginated(
        this.pageNumber, this.pageSize,
        this.searchTerm, this.filterStatus,
        this.sortField, this.sortOrder, this.filterCategoryId
      )
      .subscribe({
        next: (result) => {
          this.services = result.items;
          this.totalItems = result.totalItems;
        },
        error: (err) => console.error(err)
      });
  }

  loadCategories(): void {
    this.serviceService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  addService(): void {
    if (this.addForm.invalid) return;

    const formData = this.addForm.value;

    const newService = {
      categoryId: formData.categoryId,
      name: formData.name,
      description: formData.description,
      fixedPrice: formData.fixedPrice,
      estimatedMinutes: formData.estimatedMinutes,
      serviceType: formData.serviceType,
      isActive: formData.isActive
    };

    this.serviceService.add(newService).subscribe({
      next: () => {
        this.getServices();
        this.addForm.reset({
          categoryId: null,
          name: '',
          description: '',
          fixedPrice: 1,
          estimatedMinutes: 1,
          serviceType: 'Fixed',
          isActive: true
        });
        this.addCloseBtn.nativeElement.click();
      },
      error: (err) => {
        console.error('Failed to save service:', err);
        this.toastr.error('Failed to save service.', 'Error');
      }
    });
  }

  openEditModal(service: ServiceItem): void {
    this.selectedService = { ...service };
    this.editForm.patchValue({
      id: service.id,
      categoryId: service.categoryId,
      name: service.name,
      description: service.description,
      fixedPrice: service.fixedPrice,
      estimatedMinutes: service.estimatedMinutes,
      serviceType: service.serviceType
    });
  }

updateService(): void {
  if (this.editForm.invalid || !this.selectedService) return;

  const formValues = this.editForm.value;

  const updatedService: ServiceUpdateDTO = {
    id: formValues.id,
    categoryId: formValues.categoryId,
    name: formValues.name,
    description: formValues.description,
    fixedPrice: formValues.fixedPrice,
    estimatedMinutes: formValues.estimatedMinutes,
    serviceType: formValues.serviceType,
    isActive: this.selectedService.isActive // keep original status
  };

  this.serviceService.update(updatedService).subscribe({
    next: () => {
      this.getServices();
      this.editCloseBtn.nativeElement.click();
      this.toastr.success('Service updated successfully!', 'Success');

    },
    error: (err) => {
      console.error('Failed to update service:', err);
        this.toastr.error('Failed to update service.', 'Error');
    }
  });
}



  deleteService(): void {
    if (!this.selectedService) return;
    this.serviceService.delete(this.selectedService.id).subscribe(() => this.getServices());
  }

  resetForm(): void {
    this.selectedService = undefined;
    this.addForm.reset({ isActive: true });
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.getServices();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.getServices();
  }

 openStatusModal(service: ServiceItem): void {
  this.selectedService = { ...service };
}
toggleStatus(): void {
  if (!this.selectedService) return;

  this.serviceService.toggleStatus(this.selectedService.id).subscribe({
    next: () => {
      this.getServices();
      this.statusCloseBtn.nativeElement.click();
      this.toastr.success('Service status updated successfully!', 'Success');
    },
    error: (err) => {
      console.error('Failed to toggle status:', err);
      const errorMsg = err.error || 'Failed to toggle service status.';
      this.toastr.error(errorMsg, 'Error');
    }
  });
}

}
