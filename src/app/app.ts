import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { AutenticacaoService } from './core/services/autenticacao.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToolbarModule, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly usuarioLogado;

  constructor(
    private autenticacaoService: AutenticacaoService, 
    private router: Router) {
      this.usuarioLogado = toSignal(this.autenticacaoService.obterUsuarioLogado(), { initialValue: null });
  }

  async logoff() {
    await this.autenticacaoService.logout();
    await this.router.navigateByUrl('/login');
  }
}
