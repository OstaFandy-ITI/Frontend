import { Component } from '@angular/core';
import { CategoryService } from '../../Admin/services/Category.service';
import { Category } from '../../../core/models/category.models';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../Layout/navbar/navbar.component";
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [CommonModule, NavbarComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
categories: Category[] = [];
 

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories = res,
      error: (err) => console.error('Failed to load categories', err)
    });
  }
goToBooking(categoryId: number) {
  this.router.navigate(['/booking'], {
    queryParams: { categoryId }
  });
}

}
