import { Component } from '@angular/core';
import { CategoryService } from '../../Admin/services/Category.service';
import { Category } from '../../../core/models/category.models';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../Layout/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../Layout/footer/footer.component';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import {
  OrderFeedback,
  OrderFeedbackFilters,
  OrderFeedbackResponse,
} from '../../../core/models/Orderfeedback';
import { OrderFeedbackService } from '../../Admin/services/order-feedback.service.service';
declare var bootstrap: any;

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    NavbarComponent,
    RouterModule,
    FooterComponent,
    ChatbotComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  categories: Category[] = [];
  allOrdersFeedback: OrderFeedback[] = [];
  pendingCategoryId: number = 0;
  confirmModal: any;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private orderFeedbackService: OrderFeedbackService
  ) {}

  ngOnInit(): void {
    this.loadOrdersFeedback();
    this.categoryService.getAll().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Failed to load categories', err),
    });
    
    this.confirmModal = new bootstrap.Modal(
      document.getElementById('confirmChangeModal')
    );
  }

  createRange(number: number): number[] {
    return new Array(number);
  }

 goToBooking(categoryId: number) {
    const oldCategoryId = +localStorage.getItem('currentCategoryId')! || 0;

    if (categoryId !== oldCategoryId) {
      const hasCachedData =
        localStorage.getItem('selectedServices') ||
        localStorage.getItem('bookingData');

      if (hasCachedData) {
        this.pendingCategoryId = categoryId;
        this.confirmModal.show();
      } else {
        this.navigateToBooking(categoryId);
      }
    } else {
      this.navigateToBooking(categoryId);
    }
  }

  proceedCategoryChange() {
    localStorage.removeItem('selectedServices');
    localStorage.removeItem('bookingData');
    localStorage.setItem('currentCategoryId', this.pendingCategoryId.toString());

    this.confirmModal.hide();

    this.navigateToBooking(this.pendingCategoryId);
  }

  private navigateToBooking(categoryId: number) {
    localStorage.setItem('currentCategoryId', categoryId.toString());
    this.router.navigate(['/booking'], {
      queryParams: { categoryId },
    });
  }
  //handle chatbot
  showChat = false;

  toggleChat() {
    this.showChat = !this.showChat;
  }

  closeChat() {
    this.showChat = false;
  }

  loadOrdersFeedback(): void {
    const filters: OrderFeedbackFilters = {
      searchString: '',
      pageNumber: 1,
      pageSize: 5,
    };

    this.orderFeedbackService.getAllOrdersFeedback(filters).subscribe({
      next: (response: OrderFeedbackResponse) => {
        this.allOrdersFeedback = response.data;
      },
      error: (error) => {
        console.error('Error loading orders feedback:', error);
      },
    });
  }
}
