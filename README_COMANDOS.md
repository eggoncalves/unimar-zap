# COMANDOS

Este documento resume os principais comandos/funções usados no projeto, agrupados por categoria.

## Firebase

### `serverTimestamp`
Retorna um valor de timestamp gerado no servidor do Firestore.

- **Quando usar:** ao criar/atualizar campos de data (ex.: `criadoEm`, `ultimaMensagemEm`).
- **Vantagem:** evita depender do relógio do cliente.

---

### `collection`
Cria uma referência para uma coleção no Firestore.

- **Exemplo:** `collection(firestore, 'conversas')`
- **Uso comum:** base para consultas (`query`) e escrita (`addDoc`).

---

### `query`
Monta uma consulta Firestore a partir de uma referência (`collection`) + filtros/ordenação/limite.

- **Exemplo:** `query(colRef, where(...), orderBy(...), limit(...))`
- **Uso comum:** listar dados com critérios.

---

### `or`
Combina condições de consulta com lógica **OU** no Firestore.

- **Exemplo:** buscar conversas onde o usuário é `participanteAUId` **ou** `participanteBUId`.

---

### `where`
Aplica filtro em uma consulta.

- **Exemplo:** `where('participanteAUId', '==', meuUid)`
- **Operadores comuns:** `==`, `!=`, `<`, `<=`, `>`, `>=`.

---

### `orderBy`
Define ordenação dos resultados de uma consulta.

- **Exemplo:** `orderBy('ultimaMensagemEm', 'desc')`

---

### `limit`
Limita a quantidade de documentos retornados.

- **Exemplo:** `limit(80)`
- **Uso comum:** paginação simples e redução de custo/leitura.

---

### `doc`
Cria uma referência para um documento específico.

- **Exemplo:** `doc(firestore, 'conversas', conversaId)`
- **Uso comum:** `setDoc`, `updateDoc`, leitura pontual.

---

### `setDoc`
Cria/substitui um documento em um caminho específico.

- **Exemplo:** `setDoc(docRef, dados, { merge: true })`
- **`merge: true`:** atualiza sem sobrescrever totalmente os campos existentes.

---

### `addDoc`
Adiciona um documento novo em uma coleção com ID gerado automaticamente.

- **Exemplo:** `addDoc(collectionRef, dados)`

---

### `updateDoc`
Atualiza campos específicos de um documento existente.

- **Exemplo:** `updateDoc(docRef, { ultimaMensagem: texto })`
- **Observação:** falha se o documento não existir.

---

### `deleteDoc`
Remove um documento do Firestore.

- **Exemplo:** `deleteDoc(docRef)`

---

### `collectionData`
Converte uma consulta/referência Firestore em `Observable` (tempo real) no AngularFire.

- **Exemplo:** `collectionData(q, { idField: 'uId' })`
- **Uso comum:** telas reativas com atualização automática.

---

### `getDocs`
Executa uma consulta uma única vez e retorna um snapshot (sem stream em tempo real).

- **Uso comum:** buscas pontuais, validações, carregamento único.

## Rx

### `pipe`
Encadeia operadores para transformar ou controlar um `Observable`.

- **Exemplo:** `usuario$.pipe(switchMap(...))`

---

### `switchMap`
Troca para um novo `Observable` a cada emissão anterior, cancelando o anterior.

- **Uso comum:** depende do resultado de outro stream (ex.: auth -> busca usuário no Firestore).
- **Vantagem:** evita concorrência desnecessária e dados "atrasados".

---

### `of`
Cria um `Observable` que emite valores literais.

- **Exemplo:** `of(null)`
- **Uso comum:** retorno rápido quando não há dados/sessão.

---

### `from`
Converte `Promise`, array ou iterável em `Observable`.

- **Exemplo:** `from(this.usuarios.obterUsuarioPorUid(uid))`
- **Uso comum:** integrar funções assíncronas (`Promise`) em fluxo Rx.

## Angular

### `$any`
Função de template para fazer cast flexível (equivalente a `as any`) em expressões HTML do Angular.

- **Exemplo:** `$any(item.ultimaMensagemEm)?.toDate?.()`
- **Quando usar:** contornar limitações de tipagem no template.
- **Cuidado:** reduz segurança de tipos; prefira tipar corretamente no TypeScript quando possível.
