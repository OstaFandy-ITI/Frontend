import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiceItem, ServiceService } from '../services/Service.service';

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
  pageSize = 7;
  totalItems = 0;

  searchTerm: string = '';
  filterStatus: string = 'All';

  addForm!: FormGroup;
  editForm!: FormGroup;
sortField: string = 'name';
sortOrder: 'asc' | 'desc' = 'asc';

  @ViewChild('addCloseBtn') addCloseBtn!: ElementRef;

  constructor(
    private serviceService: ServiceService,
    private fb: FormBuilder
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
      serviceType: ['Fixed', Validators.required],
      isActive: [true]
    });
  }
getServices(): void {
  this.serviceService
  .getPaginated(this.pageNumber, this.pageSize, this.searchTerm, this.filterStatus, this.sortField, this.sortOrder)
  .subscribe({
      next: result => {
        this.services = result.items;
        this.totalItems = result.totalItems;
      },
      error: err => console.error(err)
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
        alert('Failed to save service. Please check inputs.');
      }
    });
  }

  edit(service: ServiceItem): void {
    this.selectedService = { ...service };
    this.editForm.patchValue(service);
  }

  editService(): void {
    if (this.editForm.invalid) return;

    const updated: ServiceItem = {
      ...this.selectedService!,
      ...this.editForm.value,
      updatedAt: new Date().toISOString()
    };

    this.serviceService.update(updated).subscribe(() => this.getServices());
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

}
