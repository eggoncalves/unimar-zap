import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { CadastrarComponent } from './features/auth/cadastrar/cadastrar.component';
import { authGuard } from './core/guards/auth.guard';
import { ConversaComponent } from './features/chat/conversa/conversa.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'conversa' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastrar', component: CadastrarComponent },
  { path: 'conversa', component: ConversaComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'conversa' }        
];
