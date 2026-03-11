import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutenticacaoService } from '../../../core/services/autenticacao.service';

@Component({
  selector: 'app-cadastrar',
  imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.scss',
})
export class CadastrarComponent {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  model = {
    nome: '',
    email: '',
    senha: ''
  }

  async cadastrarUsuario() {
    await this.autenticacaoService.cadastrarUsuario(this.model.email, this.model.senha, this.model.nome);
    this.router.navigateByUrl('/conversa');
  }
}
