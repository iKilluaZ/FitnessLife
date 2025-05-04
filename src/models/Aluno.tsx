export interface Aluno {
  id: string; // ou number
  nome: string;
  email: string;
  senha: string;
  idade?: number; // Opcional
  altura?: number; // Opcional
  peso?: number; // Opcional
}
