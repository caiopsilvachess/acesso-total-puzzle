import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { exercicios, Exercicio } from "./exercicios/exercicios";
import "./App.css";

const ChessboardWithDnd = () => {
  const [game, setGame] = useState(new Chess());
  const [exercicioAtual, setExercicioAtual] = useState(0);

  useEffect(() => {
    carregarExercicio(exercicios[0]);
  }, []);

  const carregarExercicio = (exercicio: Exercicio) => {
    const novoGame = new Chess();
    novoGame.loadPgn(exercicio.pgn);
    setGame(novoGame);
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

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // sempre promove para rainha por simplicidade
      });

      if (move === null) return false;
      setGame(new Chess(game.fen()));
      return true;
    } catch (e) {
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
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return <ChessboardWithDnd />;
};

export default App;
