import { Component } from '@angular/core';
import { CategoryService } from '../../Admin/services/Category.service';
import { Category } from '../../../core/models/category.models';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../Layout/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../Layout/footer/footer.component';
import { ChatbotComponent } from "../chatbot/chatbot.component";
import { OrderFeedback, OrderFeedbackFilters, OrderFeedbackResponse } from '../../../core/models/Orderfeedback';
import { OrderFeedbackService } from '../../Admin/services/order-feedback.service.service';
@Component({
  selector: 'app-home',
  imports: [CommonModule, NavbarComponent, RouterModule, FooterComponent, ChatbotComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  categories: Category[] = [];
  allOrdersFeedback: OrderFeedback[] = [];  
  

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
  }

  createRange(number: number): number[] {
    return new Array(number);
  }
  
  goToBooking(categoryId: number) {
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
        searchString:'',
        pageNumber: 1,
        pageSize: 5
      };
  
      this.orderFeedbackService.getAllOrdersFeedback(filters).subscribe({
        next: (response: OrderFeedbackResponse) => {
          this.allOrdersFeedback = response.data;
        },
        error: (error) => {
          console.error('Error loading orders feedback:', error);
        }
      });
    }
}
