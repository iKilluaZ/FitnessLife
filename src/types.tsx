export type Exercicio = {
  nome: string;
  series: number;
  repeticoes: number;
  pausa: number;
};

export type Treino = {
  nomeTreino: string;
  data: string;
  calorias: number;
  exercicios: Exercicio[];
};

export type Aluno = {
  id?: string;
  nome: string;
  idade?: number;
  email: string;
  isProfessor?: boolean; // Adicionei para compatibilidade com SQLite
  cref?: string; // Adicionei para professores
  MontarTreino?: Treino[] | null;
};

// Tipos de navegação (mantenha esses)
export type RootStackParamList = {
  LoginCadastro: undefined;
  TelaAluno: undefined;
  DetalhesTreino: {treino: Treino; alunoEmail: string};
  MontarTreino: {aluno: {nome: string; email: string}};
  RecuperarSenha: undefined;
  Cadastro: undefined;
  VisualizarTreinos: {aluno: {nome: string; email: string}};
  VerificarUsuario: undefined;
  TelaProfessor: undefined;
  TreinoDoDia: {aluno: any};
};
