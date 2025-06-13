export interface Exercicio {
  titulo: string;
  nivel: string;
  white: string;
  black: string;
  pgn: string;
}

export const exercicios: Exercicio[] = [
  {
    titulo: "Profilaxia",
    nivel: "**",
    white: "De Siqueira, Luigy Lira",
    black: "Oro, Faustino",
    pgn: `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "De Siqueira, Luigy Lira"]
[Black "Oro, Faustino"]
[Result "*"]
[SetUp "1"]
[FEN "4r1k1/p1p2ppp/3p4/2p5/5P2/2r5/P2R2KP/2B2R2 b - - 0 1"]

1... f5 *`,
  },
  {
    titulo: "Profilaxia",
    nivel: "**",
    white: "Oro, Faustino",
    black: "Ribeiro, Matheus Mendes Domingues",
    pgn: `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Oro, Faustino"]
[Black "Ribeiro, Matheus Mendes Domingues"]
[Result "*"]
[SetUp "1"]
[FEN "r4k2/p4pp1/4pn1p/3pb3/1P5B/3BP3/P4PPP/2R3K1 w - - 0 1"]

1. f3 *`,
  },
  {
    titulo: "Profilaxia",
    nivel: "**",
    white: "Carlsen, Magnus",
    black: "Firouzja, Alireza",
    pgn: `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Carlsen, Magnus"]
[Black "Firouzja, Alireza"]
[Result "*"]
[SetUp "1"]
[FEN "r1bqr1k1/1p3pb1/n1pp1npp/p3p3/2P1P3/1PNP1NPP/PB3PB1/R2QR1K1 b - - 0 1"]

1... Nc5 2. Rb1 Ne6 *`,
  },
  {
    titulo: "Profilaxia",
    nivel: "**",
    white: "Firouzja, Alireza",
    black: "Fedoseev, Vladimir",
    pgn: `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "Firouzja, Alireza"]
[Black "Fedoseev, Vladimir"]
[Result "*"]
[SetUp "1"]
[FEN "2r1r1k1/p2n1pp1/bpp1p1np/4P3/2PPB1P1/P4NB1/3K1P1P/2R4R w - - 0 1"]

1. Rhe1 c5 2. d5 exd5 3. cxd5 *`,
  },
];
