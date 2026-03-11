import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ListboxModule } from 'primeng/listbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';

import { AutenticacaoService } from '../../../core/services/autenticacao.service';
import { ConversaService } from '../../../core/services/conversa.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { MensagemModel } from '../../../core/models/mensagem.model';
import { UsuarioModel } from '../../../core/models/usuario.model';
import { ConversaModel } from '../../../core/models/conversa.model';

@Component({
  selector: 'app-conversa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ListboxModule,
    InputTextModule,
    ButtonModule,
    DividerModule,
    AvatarModule,
    DialogModule,
  ],
  templateUrl: './conversa.component.html',
  styleUrl: './conversa.component.scss',
})
export class ConversaComponent implements OnInit {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly conversaService = inject(ConversaService);
  private readonly usuarioService = inject(UsuarioService);

  usuarioLogado: UsuarioModel = {} as UsuarioModel;

  conversas = signal<ConversaModel[]>([]);
  mensagens = signal<MensagemModel[]>([]);
  usuarios = signal<UsuarioModel[]>([]);

  conversaIdSelecionada = signal<string | null>(null);
  usuarioDestinatario = signal<UsuarioModel | null>(null);

  exibirNovaConversa = false;
  texto = '';

  ngOnInit(): void {
    this.obterUsuarioLogado();
  }

  obterUsuarioLogado() {
    this.autenticacaoService.obterUsuarioLogado().subscribe(usuario => {
        if (!usuario) {
            this.usuarioLogado = {} as UsuarioModel;
            this.conversas.set([]);
            this.mensagens.set([]);
            return;
        }

        this.usuarioLogado = usuario;
        this.carregarConversas();
    });
  }

  carregarConversas() {
    if (!this.usuarioLogado.uId) 
        return;

    this.conversaService.listarMinhasConversas(this.usuarioLogado.uId).subscribe(conversas => {
        this.conversas.set(conversas);
    });
  }

  abrirDialogNovaConversa() {
    this.exibirNovaConversa = true;
    this.usuarioService
      .listarUsuariosExcetoLogado(this.usuarioLogado.uId!)
      .subscribe(u => this.usuarios.set(u));
  }

  fecharDialogNovaConversa() {
    this.exibirNovaConversa = false;
    this.usuarioDestinatario.set(null);
  }

  listarMensagens(conversaId: string) {
    this.conversaService.listarMensagensPorConversa(conversaId).subscribe(mensagens => this.mensagens.set([...mensagens].reverse()));
  }

  async definirUsuarioDestinatario(participanteAUId: string, participanteBUId: string): Promise<void> {
    const outroUid =
      participanteAUId === this.usuarioLogado.uId
        ? participanteBUId
        : participanteAUId;

    await this.usuarioService.obterUsuarioPorUid(outroUid)
        .then(usuario => {
            this.usuarioDestinatario.set(usuario!);
    });    
  }

  async selecionarConversa(item: ConversaModel) {
    if (!item) 
        return;
   
    await this.definirUsuarioDestinatario(item.participanteAUId, item.participanteBUId);

    this.conversaIdSelecionada.set(item.uId!);

    this.listarMensagens(item.uId!);
  }

  async abrirConversa() {
    if (!this.usuarioDestinatario()) 
        return;

    const conversaId = await this.conversaService.criarOuAbrirConversa(
      this.usuarioLogado.uId!,
      this.usuarioLogado.nome!,
      this.usuarioDestinatario()!.uId!,
      this.usuarioDestinatario()!.nome!
    );

    this.definirUsuarioDestinatario(this.usuarioLogado.uId!, this.usuarioDestinatario()!.uId!);

    this.conversaIdSelecionada.set(conversaId);

    this.listarMensagens(conversaId);

    this.fecharDialogNovaConversa();
  }

  async enviar() {
    const texto = this.texto.trim();

    await this.conversaService.enviarMensagem(
       this.conversaIdSelecionada()!,
       this.usuarioLogado.uId!,
       this.usuarioDestinatario()!.uId!,
       texto
    );

    this.texto = '';
  }
}
