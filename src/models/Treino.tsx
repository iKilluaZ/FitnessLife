export interface Treino {
  id: string; // ou number
  alunoId: string; // Para quem é o treino (relaciona com Aluno)
  nomeTreino: string;
  exercicios: Exercicio[]; // Lista de exercícios
}

export interface Exercicio {
  nome: string;
  series: number;
  repeticoes: number;
}

export type TreinoResumo = {
  id: string;
  nome: string;
  calorias: number;
};

export interface Treino {
  id: string;
  nome: string;
  calorias: number;
}
