import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { exercicios, Exercicio } from "./exercicios/exercicios";
import "./App.css";

const ChessboardWithDnd = () => {
  const [game, setGame] = useState(new Chess());
  const [exercicioAtual, setExercicioAtual] = useState(0);
  const [movimentosEsperados, setMovimentosEsperados] = useState<string[]>([]);
  const [movimentoAtual, setMovimentoAtual] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [primeiroLanceNegras, setPrimeiroLanceNegras] = useState(false);
  const [erro, setErro] = useState(false);
  const [casaErro, setCasaErro] = useState<string | null>(null);

  useEffect(() => {
    carregarExercicio(exercicios[0]);
  }, []);

  const extrairFEN = (pgn: string): string | null => {
    const fenMatch = pgn.match(/\[FEN "([^"]+)"\]/);
    return fenMatch ? fenMatch[1] : null;
  };

  const extrairMovimentos = (pgn: string): string[] => {
    // Encontrar a linha que começa com o primeiro movimento
    const linhas = pgn.split("\n");
    const linhaMovimentos = linhas.find((linha) =>
      linha.trim().match(/^\d+\./)
    );
    if (!linhaMovimentos) return [];

    // Separar os movimentos e remover números e pontos
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

    console.log("Movimentos extraídos:", movimentos);
    return movimentos;
  };

  const verificarPrimeiroLance = (pgn: string): boolean => {
    const linhas = pgn.split("\n");
    const linhaMovimentos = linhas.find((linha) =>
      linha.trim().match(/^\d+\./)
    );
    if (!linhaMovimentos) return false;

    // Se o primeiro movimento começa com "1...", é lance das negras
    return linhaMovimentos.trim().startsWith("1...");
  };

  const carregarExercicio = (exercicio: Exercicio) => {
    const novoGame = new Chess();

    // Extrair FEN e carregar posição inicial
    const fen = extrairFEN(exercicio.pgn);
    if (fen) {
      novoGame.load(fen);
    }

    // Extrair movimentos do PGN
    const movimentos = extrairMovimentos(exercicio.pgn);
    setMovimentosEsperados(movimentos);

    // Verificar se o primeiro lance é das negras
    setPrimeiroLanceNegras(verificarPrimeiroLance(exercicio.pgn));

    setGame(novoGame);
    setMovimentoAtual(0);
    setFeedback("");
  };

  const proximoExercicio = () => {
    if (exercicioAtual < exercicios.length - 1) {
      setExercicioAtual(exercicioAtual + 1);
      carregarExercicio(exercicios[exercicioAtual + 1]);
    }
  };

  const exercicioAnterior = () => {
    if (exercicioAtual > 0) {
      setExercicioAtual(exercicioAtual - 1);
      carregarExercicio(exercicios[exercicioAtual - 1]);
    }
  };

  const fazerMovimentoPreto = () => {
    if (movimentoAtual < movimentosEsperados.length - 1) {
      try {
        // Criar um novo jogo e carregar a posição inicial
        const novoGame = new Chess();
        const fen = extrairFEN(exercicios[exercicioAtual].pgn);
        if (fen) {
          novoGame.load(fen);
        }

        // Aplicar os movimentos um por um
        const movimentosAteAgora = movimentosEsperados.slice(
          0,
          movimentoAtual + 2
        );
        for (const movimento of movimentosAteAgora) {
          novoGame.move(movimento);
        }

        setGame(novoGame);
        setMovimentoAtual(movimentoAtual + 1);
        setFeedback("Sua vez de jogar!");
      } catch (error) {
        console.error("Erro ao fazer movimento:", error);
        setFeedback("Erro ao processar movimento. Tente novamente.");
        setErro(true);
      }
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      // Criar uma cópia do jogo atual para testar o movimento
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false;

      // Verificar se o movimento corresponde ao esperado
      const movimentoAtualSan = move.san;
      const movimentoEsperado = movimentosEsperados[movimentoAtual];

      if (movimentoAtualSan === movimentoEsperado) {
        // Movimento correto, atualizar o jogo real
        setGame(gameCopy);
        setErro(false);
        setMovimentoAtual(movimentoAtual + 1);

        if (movimentoAtual === movimentosEsperados.length - 1) {
          // Último movimento correto
          setFeedback("Parabéns! Você completou o exercício!");
          setTimeout(() => {
            proximoExercicio();
          }, 1500);
        } else {
          // Movimento correto, mas ainda não é o último
          setFeedback("Bom movimento! Aguarde o movimento das pretas...");
          // Fazer o movimento das pretas automaticamente
          setTimeout(fazerMovimentoPreto, 1000);
        }
      } else {
        // Movimento incorreto, mas mantemos no tabuleiro
        setGame(gameCopy);
        setCasaErro(targetSquare);
        setTimeout(() => {
          setFeedback("Tente novamente! Movimento incorreto.");
          setErro(true);
        }, 100);
      }

      return true;
    } catch (e) {
      setTimeout(() => {
        setFeedback("Calma veloz! Jogada ilegal.");
        setErro(true);
      }, 100);
      return false;
    }
  };

  const tentarNovamente = () => {
    carregarExercicio(exercicios[exercicioAtual]);
    setCasaErro(null);
  };

  // Determinar a orientação do tabuleiro baseado no primeiro lance
  const orientacaoTabuleiro = () => {
    return primeiroLanceNegras ? "black" : "white";
  };

  return (
    <div className="App">
      <main>
        <div className="info">
          <p className="tema">Tema: {exercicios[exercicioAtual].titulo}</p>
          <p className="nivel">Nível: {exercicios[exercicioAtual].nivel}</p>
          <p className="jogadores">
            <span className="brancas">{exercicios[exercicioAtual].white}</span>
            <span className="pretas">{exercicios[exercicioAtual].black}</span>
          </p>
          <p className="exercicio">
            Exercício {exercicioAtual + 1} de {exercicios.length}
          </p>
        </div>
        <div className="chessboard-container">
          <Chessboard
            position={game.fen()}
            boardWidth={400}
            onPieceDrop={onDrop}
            boardOrientation={orientacaoTabuleiro()}
            customSquareStyles={{
              ...(casaErro && {
                [casaErro]: {
                  backgroundColor: "rgba(255, 0, 0, 0.7)",
                },
              }),
            }}
          />
        </div>
        <div className="controls">
          <button onClick={exercicioAnterior} disabled={exercicioAtual === 0}>
            Exercício Anterior
          </button>
          <button
            onClick={proximoExercicio}
            disabled={exercicioAtual === exercicios.length - 1}
          >
            Próximo Exercício
          </button>
        </div>
        <div className="info">
          <p>
            {movimentoAtual % 2 === 0
              ? primeiroLanceNegras
                ? "Lance das pretas"
                : "Lance das brancas"
              : primeiroLanceNegras
              ? "Lance das brancas"
              : "Lance das pretas"}
          </p>
          {feedback && (
            <div className={`feedback ${erro ? "error" : "success"}`}>
              <p>{feedback}</p>
              {erro && casaErro && (
                <button
                  className="try-again"
                  onClick={tentarNovamente}
                  title="Tentar Novamente"
                >
                  Tentar Novamente
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return <ChessboardWithDnd />;
};

export default App;
