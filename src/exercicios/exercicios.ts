export interface Exercicio {
  titulo: string;
  pgn: string;
}

export const exercicios: Exercicio[] = [
  {
    titulo: "Abertura Ruy Lopez",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
  },
  {
    titulo: "Defesa Siciliana",
    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4",
  },
];
