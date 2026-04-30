export const templates = {
  welcome: (name: string) => ({
    subject: 'Bem-vindo ao TrustCheck',
    html: `<h1>Bem-vindo, ${name}</h1><p>Sua conta foi criada com sucesso.</p>`,
  }),
  auth_confirmation: (code: string) => ({
    subject: 'Confirmacao de autenticacao',
    html: `<p>Seu codigo de confirmacao: <strong>${code}</strong></p>`,
  }),
  case_status_update: (caseId: string, status: string) => ({
    subject: `Atualizacao do caso ${caseId}`,
    html: `<p>O status do caso foi atualizado para <strong>${status}</strong>.</p>`,
  }),
};
