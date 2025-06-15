import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  CategoryService,
  Category,
  PaginatedResult,
} from '../services/Category.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  totalItems = 0;
  pageNumber = 1;
  pageSize = 5;
  totalPages = 1;

  selectedCategory: Category | null = null;
  addForm: FormGroup;
  editForm: FormGroup;
  searchTerm: string = '';
  filterStatus: string = 'All';

  @ViewChild('addCloseBtn') addCloseBtn!: ElementRef;
  @ViewChild('editCloseBtn') editCloseBtn!: ElementRef;
  @ViewChild('deleteCloseBtn') deleteCloseBtn!: ElementRef;
@ViewChild('statusCloseBtn') statusCloseBtn!: ElementRef;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder,

  private toastr: ToastrService
  ) {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      iconImg: [''],
      isActive: [true],
    });
    this.editForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.categoryService
      .getPaginated(
        this.pageNumber,
        this.pageSize,
        this.searchTerm,
        this.filterStatus
      )
      .subscribe({
        next: (result) => {
          this.categories = result.items;
          this.totalItems = result.totalItems;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
        },
        error: (err) => console.error(err),
      });
  }
  openAddModal() {
    this.addForm.reset({ isActive: true });
  }

  addCategory() {
    if (this.addForm.valid) {
      const formData = {
        name: this.addForm.value.name,
        description: this.addForm.value.description || '',
        isActive: this.addForm.value.isActive,
      };

      this.categoryService.add(formData).subscribe({
        next: () => {
          this.getCategories();
          this.addForm.reset({ isActive: true });
          this.addCloseBtn.nativeElement.click();
          this.toastr.success('Category added successfully!', 'Success');
        },
        error: (err) => {
          console.error('Add failed:', err);
          this.toastr.error('Failed to add category.', 'Error');
        },
      });
    }
  }

  openEditModal(category: Category) {
    this.selectedCategory = category;
    this.editForm.patchValue(category);
  }

  editCategory() {
    if (this.editForm.valid) {
      this.categoryService.update(this.editForm.value).subscribe({
        next: () => {
          this.getCategories();
          this.editCloseBtn.nativeElement.click();
        },
        error: (err) => alert('Edit failed: ' + err.message),
      });
    }
  }

  openDeleteModal(category: Category) {
    this.selectedCategory = category;
  }

  deleteCategory() {
    if (this.selectedCategory) {
      this.categoryService.delete(this.selectedCategory.id).subscribe({
        next: () => {
          this.getCategories();
          alert('Category deleted successfully');
          this.deleteCloseBtn.nativeElement.click();
        },
        error: (err) => alert('Delete failed: ' + err.message),
      });
    }
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.getCategories();
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageNumber = 1;
    this.getCategories();
  }


  openStatusModal(category: Category): void {
  this.selectedCategory = { ...category };
}

toggleStatus(): void {
  if (!this.selectedCategory) return;

  this.categoryService.toggleStatus(this.selectedCategory.id).subscribe({
    next: () => {
      this.getCategories();
      this.statusCloseBtn.nativeElement.click();
      this.toastr.success('Category status updated successfully!', 'Success');
    },
    error: (err) => {
      console.error('Failed to toggle status:', err);
      const errorMsg = err.error || 'Failed to toggle category status.';
      this.toastr.error(errorMsg, 'Error');
    }
  });
}


}
