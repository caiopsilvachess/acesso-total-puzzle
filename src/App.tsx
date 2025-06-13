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

  useEffect(() => {
    carregarExercicio(exercicios[0]);
  }, []);

  const carregarExercicio = (exercicio: Exercicio) => {
    const novoGame = new Chess();
    setGame(novoGame);

    // Separar os movimentos do PGN
    const movimentos = exercicio.pgn
      .split(" ")
      .filter((m) => m.trim() !== "" && !m.endsWith(".") && m !== "*");

    setMovimentosEsperados(movimentos);
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
      // Criar um novo jogo e carregar o PGN completo até o movimento atual + 1
      const novoGame = new Chess();
      const pgnCompleto = movimentosEsperados
        .slice(0, movimentoAtual + 2)
        .join(" ");
      novoGame.loadPgn(pgnCompleto);
      setGame(novoGame);
      setMovimentoAtual(movimentoAtual + 2);
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
        setFeedback("Tente novamente! Movimento incorreto.");
        return false; // Reverte o movimento incorreto
      }

      return true;
    } catch (e) {
      setFeedback("Tente novamente! Movimento incorreto.");
      return false;
    }
  };

  return (
    <div className="App">
      <main>
        <div className="chessboard-container">
          <Chessboard
            position={game.fen()}
            boardWidth={400}
            onPieceDrop={onDrop}
            boardOrientation="white"
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
            {exercicios[exercicioAtual].titulo} - Exercício {exercicioAtual + 1}{" "}
            de {exercicios.length}
          </p>
          <p>
            Movimento {Math.floor(movimentoAtual / 2) + 1} de{" "}
            {Math.ceil(movimentosEsperados.length / 2)}
          </p>
          {feedback && (
            <p
              className={
                feedback.includes("Parabéns")
                  ? "feedback-success"
                  : "feedback-error"
              }
            >
              {feedback}
            </p>
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
