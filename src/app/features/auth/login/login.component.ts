import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { AutenticacaoService } from '../../../core/services/autenticacao.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, InputTextModule, DividerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);  

  model = {
    email: '',
    senha: ''
  }

  async loginEmailSenha() {
    await this.autenticacaoService.loginEmailSenha(this.model.email, this.model.senha);
    this.router.navigateByUrl('/conversa');
  }

  async loginGoogle() {
    await this.autenticacaoService.loginGoogle();
    this.router.navigateByUrl('/conversa');
  }
}
