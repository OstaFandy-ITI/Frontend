import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CategoryService } from '../services/Category.service';
import { Category, PaginatedResult } from '../../../core/models/category.models';

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

  addImg?: File;
editImg?: File;
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
    const formData = new FormData();
    formData.append('name', this.addForm.value.name);
    formData.append('description', this.addForm.value.description || '');
    formData.append('isActive', this.addForm.value.isActive ? 'true' : 'false');

    if (this.addImg) {
      formData.append('iconImg', this.addImg);
    }

    this.categoryService.add(formData).subscribe({
      next: () => {
        this.getCategories();
        this.addForm.reset({ isActive: true });
        this.addImg = undefined;
        this.addCloseBtn.nativeElement.click();
        this.toastr.success('Category added successfully!', 'Success');
      },
      error: (err) => {
        console.error('Add failed:', err);
        this.toastr.error('Failed to add category.', 'Error');
      }
    });
  }
}

  openEditModal(category: Category) {
    this.selectedCategory = category;
    this.editForm.patchValue(category);
  }

editCategory() {
  if (this.editForm.valid && this.selectedCategory) {
    const formData = new FormData();
    formData.append('id', this.editForm.value.id);
    formData.append('name', this.editForm.value.name);
    formData.append('description', this.editForm.value.description || '');

    if (this.editImg) {
      formData.append('iconImg', this.editImg);
    }

    this.categoryService.update(this.editForm.value.id, formData).subscribe({
      next: () => {
        this.getCategories();
        this.editForm.reset();
        this.editImg = undefined;
        this.editCloseBtn.nativeElement.click();
        this.toastr.success('Category updated successfully!', 'Success');
      },
      error: (err) => {
        console.error('Edit failed:', err);
        this.toastr.error('Failed to update category.', 'Error');
      }
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
onAddImgSelected(event: any) {
  this.addImg = event.target.files[0];
}

onEditImgSelected(event: any) {
  this.editImg = event.target.files[0];
}

}
