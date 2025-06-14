export const extrairFEN = (pgn: string): string | null => {
  const fenMatch = pgn.match(/\[FEN "([^"]+)"\]/);
  return fenMatch ? fenMatch[1] : null;
};

export const extrairMovimentos = (pgn: string): string[] => {
  const linhas = pgn.split("\n");
  const linhaMovimentos = linhas.find((linha) => linha.trim().match(/^\d+\./));
  if (!linhaMovimentos) return [];

  const movimentos = linhaMovimentos.split(" ").filter((m) => {
    const movimento = m.trim();
    return (
      movimento !== "" &&
      !movimento.endsWith(".") &&
      movimento !== "*" &&
      !movimento.match(/^\d+\.\.\.$/) &&
      !movimento.match(/^\d+\.$/)
    );
  });

  return movimentos;
};

export const verificarPrimeiroLance = (pgn: string): boolean => {
  const linhas = pgn.split("\n");
  const linhaMovimentos = linhas.find((linha) => linha.trim().match(/^\d+\./));
  if (!linhaMovimentos) return false;

  return linhaMovimentos.trim().startsWith("1...");
};
