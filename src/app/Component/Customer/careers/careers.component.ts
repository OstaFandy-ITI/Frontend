import { Component } from '@angular/core';
import { NavbarComponent } from "../Layout/navbar/navbar.component";
import { FooterComponent } from "../Layout/footer/footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.css',
imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent
  ]
})
export class CareersComponent {
 successStories = [
   {
      name: 'Om Mostafa',
      job: 'Cleaning Specialist',
      image: 'https://res.cloudinary.com/dy35wrc6z/image/upload/v1749993122/zts6goqwsjoa6ykj7dbb.jpg',
      story: 'The health insurance benefit was a game changer. I feel secure, respected, and empowered.'
    },
    {
      name: 'Ahmed',
      job: 'Electrician',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3saaNPz8N-cGyAcTn8rQmuVBTuHRlGar-iA&s',
      story: 'OstaFandy gave me job security. Now, I work on my schedule, and I’m finally able to save and plan for the future.'
    },
    {
      name: 'Sara',
      job: 'Painter',
      image: 'https://images.dailynewsegypt.com/2018/09/1-5_1-ATR_6538.jpg',
      story: 'The fixed salary and supportive environment helped me focus on my art. I’m proud to be part of this company.'
    },
    {
      name: 'Youssef',
      job: 'Plumber',
      image: 'https://media.istockphoto.com/id/1185666444/photo/portrait-of-syrian-man.jpg?s=612x612&w=0&k=20&c=H0nJ4-a9D5vgu7YenHkHvhYRSxcKKL1_R762kGPyW5c=',
      story: 'I used to chase clients. Now, clients come to me. OstaFandy handles everything and I focus on my work.'
    },
   
    {
      name: 'Mohamed',
      job: 'Carpenter',
      image: 'https://media.istockphoto.com/id/1443615430/photo/portrait-of-a-mature-man-in-front-of-his-store-on-a-bazaar-market.jpg?s=612x612&w=0&k=20&c=B638H1sFcQlvX5bCEh1Wx_80QL1Xqoj_yAIJ0Nrn1-w=',
      story: 'The team spirit at OstaFandy makes every job enjoyable. It’s the best decision I’ve made in my career.'
    },
       {
      name: 'Ahmed',
      job: 'Electrician',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZEDDj17ql5O_iqQxQhXfS4qLEA9KLNhLhWA&s',
      story: 'OstaFandy gave me job security. Now, I work on my schedule, and I’m finally able to save and plan for the future.'
    },
  ];
}

