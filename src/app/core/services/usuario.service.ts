import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { UsuarioModel } from '../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'usuarios';

  /**Listar Usuários */
  listarUsuarios(): Observable<UsuarioModel[]> {
    const colecaoRef = collection(this.firestore, this.collectionName);

    //Exemplo: Ordenar por Nome
    const q = query(colecaoRef, orderBy('nome', 'asc'));

    //collectionData injeta o id automaticamente em 'idField'
    return collectionData(q, { idField: 'uId' }) as Observable<UsuarioModel[]>;
  }

  listarUsuariosExcetoLogado(uIdLogado: string): Observable<UsuarioModel[]> {
    const colecaoRef = collection(this.firestore, this.collectionName);

    const q = query(
      colecaoRef,
      where('uId', '!=', uIdLogado),
      orderBy('uId'),           // obrigatório junto com "!="
      orderBy('nome', 'asc')    // sua ordenação final
    );

    // const q = query(
    //   colecaoRef,
    //   where(documentId(), 'not-in', [uIdLogado]),
    //   orderBy('nome', 'asc')    // sua ordenação final
    // );   

    return collectionData(q) as Observable<UsuarioModel[]>;
  }

  /** Obter Usuário por DocumentoId */
  obterUsuarioPorDocumentId(uId: string): Observable<UsuarioModel> {
    //const docRef = doc(this.firestore, `${this.collectionName}/${uId}`);    
    const docRef = doc(this.firestore, this.collectionName, uId);

    return docData(docRef, { idField: 'uId' }) as Observable<UsuarioModel>;
  }

  /** Obter Usuário por uId */
  async obterUsuarioPorUid(uId: string) : Promise<UsuarioModel | null> {
    const colRef = collection(this.firestore, 'usuarios');

    const q = query(
      colRef,
      where('uId', '==', uId),
      limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const docSnap = snap.docs[0];
    return { ...docSnap.data() } as UsuarioModel;
  }

  /** Adicionar Usuário - Firestore gerar o ID */
  async adicionarUsuario(usuario: UsuarioModel): Promise<string> {
    const colRef = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(colRef, usuario);

    return docRef.id;
  }

  /** Atualizar (atualiza só campos enviados) - Firestore usar o ID fornecido */
  async atualizarUsuario(usuario: UsuarioModel): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, usuario.uId!);

    await updateDoc(docRef, {usuario});
  }

  /** Adicionar ou Atualizar Usuário (adiciona se não existir / atualiza se existir) - Firestore usa o ID fornecido */
  async upsertUsuario(usuario: UsuarioModel): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, usuario.uId!); 
    await setDoc(docRef, usuario, { merge: true });      
  }

  /** Deletar Usuário - Firestore usar o ID fornecido */
  async deletarUsuario(uId: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, uId);
    await deleteDoc(docRef);
  }

  /** Buscar por E-mail */
  buscarPorEmail(email: string): Observable<UsuarioModel[]> {
    const colRef = collection(this.firestore, this.collectionName);

    const q = query(colRef, where('email', '==', email), limit(10));
    
    return collectionData(q, { idField: 'uId' }) as Observable<UsuarioModel[]>;

    /** Tipos de Operadores */
    // == (igual)
    // != (diferente)
    // <  (menor)
    // <= (menor ou igual)
    // >  (maior)
    // >= (maior ou igual)
    
    //Começa com... (Adapdatado)
    //const colRef = collection(this.db, 'usuarios');
    //const termo = 'ana';

    //const q = query(
    //  colRef,
    //  where('nome', '>=', termo),
    //  where('nome', '<=', termo + '\uf8ff')
    //);

    // \uf8ff é um caractere Unicode especial usado como um “marcador de fim” nas buscas do Firestore.
    // 👉 Ele representa um caractere muito alto na tabela Unicode, então praticamente qualquer letra vem antes dele.

    //O \uf8ff é como dizer:
    //“vá até o último possível texto que ainda começa com isso (Neste caso 'ana'”.
  } 
}
