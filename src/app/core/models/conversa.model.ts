export interface ConversaModel {
    uId?: string;

    participanteAUId: string;
    participanteANome: string;

    participanteBUId: string;
    participanteBNome: string;    

    ultimaMensagemEm?: any;

    criadoEm?: any;
}
