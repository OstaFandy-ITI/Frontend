import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import{URL} from '../../../core/Shared/URL'
import { UserChatRequestDto, UserChatResponseDto } from '../../../core/models/Chatbot.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private BaseUrl = `${URL.apiUrl}/Chatbot`;

  constructor(private http:HttpClient) { }

  ///api/Chatbot/suggest
  sendMessage(usermsg:UserChatRequestDto):Observable<UserChatResponseDto>
  {
    return this.http.post<UserChatResponseDto>(`${this.BaseUrl}/suggest`,usermsg)
  }
}
