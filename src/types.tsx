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
  exercicios: {
    nome: string;
    series: number;
    repeticoes: number;
    pausa: number;
  }[];
};

export type Aluno = {
  id: string;
  nome: string;
  idade: number;
  email: string;
  MontarTreino: Treino[] | null;
};

export type RootStackParamList = {
  VerificarUsuario: undefined;
  LoginCadastro: undefined;
  TelaAluno: undefined;
  DetalhesTreino: {treino: Treino};
  MontarTreino: {aluno: Aluno};
  RecuperarSenha: undefined;
  Cadastro: undefined;
};
