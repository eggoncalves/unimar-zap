# EXPLICAÇÃO DO FIRESTORE.RULES

Este documento descreve o comportamento do arquivo de regras do Firestore do projeto, explicando quem pode ler/escrever cada coleção e quais validações são aplicadas.

## Visão geral

As regras seguem dois princípios principais:

- Somente usuários autenticados podem acessar dados.
- O acesso a conversas e mensagens é restrito aos participantes da conversa.

---

## Estrutura base

### `rules_version = '2'`
Define a versão da linguagem de regras do Firestore.

### `service cloud.firestore` e `match /databases/{database}/documents`
Escopo principal onde todas as regras dos documentos são declaradas.

---

## Funções auxiliares

### `autenticado()`
Retorna verdadeiro quando existe usuário autenticado.

- Regra: `request.auth != null`
- Objetivo: evitar repetição dessa condição em várias permissões.

### `uid()`
Retorna o identificador do usuário autenticado.

- Regra: `request.auth.uid`
- Objetivo: facilitar comparações de propriedade/participação.

### `ehParticipante(conversaId)`
Valida se o usuário autenticado é participante da conversa.

- Busca o documento da conversa pelo id.
- Compara o uid atual com os campos `participanteAUId` e `participanteBUId`.
- Só retorna verdadeiro se estiver autenticado e for um dos participantes.

---

## Regras da coleção usuarios

### Caminho: `/usuarios/{userId}`
Permissão:

- `allow read, write`: apenas quando autenticado e `uid() == userId`.

Impacto:

- Cada usuário só lê/escreve seu próprio documento em usuarios.

### Subcoleção: `/usuarios/{userId}/dispositivos/{tokenId}`
Permissão:

- `allow read, write`: mesma regra do documento pai.

Impacto:

- Tokens/dispositivos também ficam isolados por usuário.

---

## Regras da coleção conversas

### Caminho: `/conversas/{conversaId}`

#### Create
Permitido apenas se todas as condições abaixo forem verdadeiras:

- Usuário autenticado.
- `request.resource.data.uId == conversaId`.
- `participanteAUId` e `participanteBUId` são string.
- `participanteANome` e `participanteBNome` são string.
- `criadoEm` é timestamp.
- Os participantes são diferentes entre si.
- O usuário autenticado é um dos dois participantes.

Impacto:

- Evita criação de conversa com estrutura inválida.
- Evita conversa onde o usuário não pertence aos participantes.

#### Read e Update

- `allow read, update: if ehParticipante(conversaId)`

Impacto:

- Somente participantes podem ler e atualizar a conversa.

#### Delete

- `allow delete: if false`

Impacto:

- Conversas não podem ser removidas por clientes.

---

## Regras da subcoleção mensagens

### Caminho: `/conversas/{conversaId}/mensagens/{mensagemId}`

#### Read

- Permitido apenas para participante da conversa (`ehParticipante`).

#### Create
Permitido apenas se:

- Usuário é participante da conversa.
- `remetenteUid` da mensagem é igual ao uid autenticado.
- `texto` é string.
- `texto` possui no máximo 1000 caracteres.
- `criadoEm` é timestamp.

Impacto:

- Impede envio de mensagem em nome de outro usuário.
- Garante formato mínimo da mensagem.

#### Update e Delete

- `allow update, delete: if false`

Impacto:

- Mensagens enviadas não podem ser alteradas/excluídas por clientes.

---

## Resumo de segurança

As regras atuais garantem:

- Isolamento de dados de perfil por usuário.
- Conversas acessíveis somente por seus participantes.
- Mensagens somente de autores autenticados e participantes.
- Bloqueio de exclusão de conversas/mensagens no cliente.

## Ponto de atenção

Como `update` de conversa está liberado para qualquer participante, ainda é possível tentar alterar campos sensíveis (como participantes) em uma atualização. Se desejar, pode-se endurecer a regra de update para permitir alteração apenas de campos específicos, como `ultimaMensagem` e `ultimaMensagemEm`.
