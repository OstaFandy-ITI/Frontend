import {HttpInterceptorFn} from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtService } from '../services/jwt.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();


  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        
        authService.Logout();
        location.reload();  
      }
      return throwError(() => error);
    })
  );

  return next(req);
};
