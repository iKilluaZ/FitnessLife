// Representa um exercício dentro de um treino
export interface Exercicio {
  id?: number;
  nome: string;
  series: number;
  repeticoes: number;
  pausa: number;
  grupo_muscular_id?: number;
  treino_id?: number;
  grupoMuscular?: string; // usado na exibição (opcional)
}

// Representa um treino atribuído a um aluno
export interface Treino {
  id?: number;
  aluno_email: string;
  nomeTreino: string;
  calorias: number;
  ordem?: number; // ordem sequencial definida pelo professor
  data?: string; // opcional se for ordem sequencial
  exercicios?: Exercicio[];
  professor_nome?: string;
  professor_email?: string; // novo campo para e-mail do professor
}

// Representa um aluno ou professor no sistema
export type Aluno = {
  id?: number;
  nome: string;
  email: string;
  idade?: number;
  isProfessor?: boolean;
  cref?: string;
  MontarTreino?: Treino[] | null;
};

// Representa o progresso do aluno com base na ordem
export interface ProgressoAluno {
  aluno_email: string;
  ultimo_treino_ordem: number;
  data_ultimo_treino: string;
}

// Tipos de navegação usados no createStackNavigator
export type RootStackParamList = {
  LoginCadastro: undefined;
  TelaAluno: undefined;
  DetalhesTreino: {treino: Treino; alunoEmail: string; professorEmail?: string};
  MontarTreino: {aluno: Aluno; treino?: Treino; professorEmail?: string}; // <-- aqui
  RecuperarSenha: undefined;
  Cadastro: undefined;
  VisualizarTreinos: {aluno: Aluno; isProfessor: boolean};
  VerificarUsuario: undefined;
  TelaProfessor: undefined;
  TreinoDoDia: {aluno: Aluno};
  TelaExecutarTreino: {treinoId: number; alunoEmail: string};
};
