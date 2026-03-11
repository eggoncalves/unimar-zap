import { inject, Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword } from '@angular/fire/auth';
import { UsuarioService } from './usuario.service';
import { UsuarioModel } from '../models/usuario.model';
import { serverTimestamp } from '@angular/fire/firestore';
import { from, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService {
  private readonly auth = inject(Auth);
  private readonly usuarios = inject(UsuarioService);  
  
  //Também pode ser injetado via construtor, mas usando inject() é mais simples e direto
  // constructor(
  //   private auth: Auth,
  //   private usuarioService: UsuarioService) { }

  readonly usuario$ = authState(this.auth);

  obterUsuarioLogado(): Observable<UsuarioModel | null> {
    return this.usuario$.pipe(
      switchMap((usuarioAuth) => {
        if (!usuarioAuth) {
          return of(null);
        }

        return from(this.usuarios.obterUsuarioPorUid(usuarioAuth.uid));
      })
    );
  }

  async cadastrarUsuario(email: string, senha: string, nome: string) {
    const usuarioCredential = await createUserWithEmailAndPassword(this.auth, email, senha);
    const usuario = usuarioCredential.user;

    const usuarioPayload: UsuarioModel = {
      uId: usuario.uid,
      nome: usuario.displayName ?? nome,
      email: usuario.email ?? '',
      criadoEm: serverTimestamp()
    }

    await this.usuarios.adicionarUsuario(usuarioPayload);
  }

  async loginEmailSenha(email: string, senha: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, senha);
    const usuario = cred.user;
    
    return usuario;
  }

  async loginGoogle() {
    const cred = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const usuario = cred.user;

    //Verificar se o usuário já existe na coleção "usuarios"
    const usuarioDoc = await this.usuarios.obterUsuarioPorUid(usuario.uid);
    if (usuarioDoc) {
      //Atualizar o nome e foto caso tenham mudado no Google
      if (usuarioDoc.nome !== usuario.displayName || usuarioDoc.fotoUrl !== usuario.photoURL) {
        const usuarioLocal: UsuarioModel = {
          uId: usuario.uid,
          nome: usuario.displayName ?? usuarioDoc.nome,
          fotoUrl: usuario.photoURL ?? usuarioDoc.fotoUrl
        };

        await this.usuarios.atualizarUsuario(usuarioLocal);
      }
    } else {
      //Se o usuário não existe, criar um novo documento
      const usuarioPayload: UsuarioModel = {
        uId: usuario.uid,
        nome: usuario.displayName ?? 'Sem Nome',
        email: usuario.email ?? '',
        fotoUrl: usuario.photoURL ?? '',
        criadoEm: serverTimestamp()
      };
      await this.usuarios.adicionarUsuario(usuarioPayload);
    }

    return usuario;
  }

  async logout() {
    await signOut(this.auth);
  }
}