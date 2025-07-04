import { Component } from '@angular/core';
import { ChatListComponent } from '../../HandyMan/chat-list/chat-list.component';
@Component({
  selector: 'app-client-messages',
  standalone: true,
  imports: [ChatListComponent],
  templateUrl: './client-messages.component.html',
  styleUrls: ['./client-messages.component.css']

})
export class ClientMessagesComponent {

}
