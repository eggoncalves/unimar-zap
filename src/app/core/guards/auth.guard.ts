import { inject } from "@angular/core";
import { AutenticacaoService } from "../services/autenticacao.service";
import { CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const autenticacaoService = inject(AutenticacaoService);

  return autenticacaoService.usuario$.pipe(
    map(usuario => {
      if (usuario) 
        return true;

      router.navigateByUrl('/login');
      
      return false;
    })
  );
};