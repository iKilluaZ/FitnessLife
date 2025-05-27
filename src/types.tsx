// Representa um exercício dentro de um treino
export interface Exercicio {
  id?: number; // pode ser undefined até ser salvo
  nome: string;
  series: number;
  repeticoes: number;
  pausa: number;
  grupo_muscular_id?: number;
  treino_id?: number;
}

// Representa um treino atribuído a um aluno
export interface Treino {
  id?: number;
  aluno_email: string;
  nomeTreino: string;
  data: string;
  calorias: number;
  exercicios?: Exercicio[];
  professor_nome?: string;
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

// Tipos de navegação usados no createStackNavigator
export type RootStackParamList = {
  LoginCadastro: undefined;
  TelaAluno: undefined;
  DetalhesTreino: {treino: Treino; alunoEmail: string};
  MontarTreino: {aluno: Aluno; treino?: Treino}; // agora suporta edição
  RecuperarSenha: undefined;
  Cadastro: undefined;
  VisualizarTreinos: {aluno: Aluno};
  VerificarUsuario: undefined;
  TelaProfessor: undefined;
  TreinoDoDia: {aluno: Aluno};
};
