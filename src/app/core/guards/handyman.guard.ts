import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserType } from '../Shared/Enum';
import { map } from 'rxjs';

export const handymanGuard: CanActivateFn = (route, state) => {
 const authServer=inject (AuthService);
  const router=inject (Router);

   return authServer.CurrentUser$.pipe(
    map(user=>{
      if(user && user.UserType === UserType.Handyman )
        return true;
      else {
        router.navigate(['/login']);
        return false;
      }
    })
  )
};
