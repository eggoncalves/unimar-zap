import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, limit, or, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ConversaModel } from '../models/conversa.model';
import { MensagemModel } from '../models/mensagem.model';

function gerarConversaId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

@Injectable({
  providedIn: 'root',
})
export class ConversaService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'conversas';

  listarMinhasConversas(meuUid: string): Observable<ConversaModel[]> {
    const colecaoRef = collection(this.firestore, this.collectionName);

    const q = query(
      colecaoRef,
        or(
          where('participanteAUId', '==', meuUid),
          where('participanteBUId', '==', meuUid)
        ),
        orderBy('ultimaMensagemEm', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<ConversaModel[]>;   
  }
  
  async criarOuAbrirConversa(meuUid: string, meuNome: string, outroUid: string, outroNome: string): Promise<string> {
    const conversaId = gerarConversaId(meuUid, outroUid);

    const conversa: ConversaModel = {
      uId: conversaId,
      participanteAUId: meuUid,
      participanteANome: meuNome,
      participanteBUId: outroUid,
      participanteBNome: outroNome,
      criadoEm: serverTimestamp()
    };

    const docRef = doc(this.firestore, this.collectionName, conversaId);
    await setDoc(docRef, conversa, { merge: true });

    return conversaId;    
  }

  async enviarMensagem(conversaId: string, remetenteUid: string, destinatarioUid: string, texto: string) {
    const colecaoRef = collection(this.firestore, `${this.collectionName}/${conversaId}/mensagens`);

    await addDoc(colecaoRef, {
      remetenteUid,
      destinatarioUid,
      texto,
      criadoEm: serverTimestamp()
    });

    const docRef = doc(this.firestore, this.collectionName, conversaId);
    await updateDoc(docRef, {
      ultimaMensagem: texto.slice(0, 80),
      ultimaMensagemEm: serverTimestamp()
    });    
  }
  
  listarMensagensPorConversa(conversaId: string): Observable<MensagemModel[]> {
      const colecaoRef = collection(this.firestore, `${this.collectionName}/${conversaId}/mensagens`);
      const q = query(
        colecaoRef,
        orderBy('criadoEm', 'desc'),
        limit(80));

      return collectionData(q, { idField: 'id' }) as Observable<MensagemModel[]>;
  }
}
