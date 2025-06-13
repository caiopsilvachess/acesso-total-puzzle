import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
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
  const [pecaSelecionada, setPecaSelecionada] = useState<Square | null>(null);
  const [movimentosPossiveis, setMovimentosPossiveis] = useState<Square[]>([]);
  const [casaSucesso, setCasaSucesso] = useState<string | null>(null);

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
    const primeiroLanceEhNegras = verificarPrimeiroLance(exercicio.pgn);
    setPrimeiroLanceNegras(primeiroLanceEhNegras);

    setGame(novoGame);
    setMovimentoAtual(0);
    setFeedback("Sua vez de jogar!");
  };

  const fazerMovimentoAutomatico = () => {
    if (movimentoAtual < movimentosEsperados.length - 1) {
      try {
        // Criar um novo jogo e carregar a posição inicial
        const novoGame = new Chess();
        const fen = extrairFEN(exercicios[exercicioAtual].pgn);
        if (fen) {
          novoGame.load(fen);
        }

        // Aplicar todos os movimentos até o movimento atual (incluindo o movimento do usuário)
        const movimentosAteAgora = movimentosEsperados.slice(
          0,
          movimentoAtual + 1
        );
        for (const movimento of movimentosAteAgora) {
          novoGame.move(movimento);
        }

        // Pegar o próximo movimento do sistema
        // Posições ímpares (1, 3, 5...) são respostas automáticas do sistema
        const proximoMovimento = movimentosEsperados[movimentoAtual + 1];
        console.log("=== Debug de Movimento Automático ===");
        console.log("Sistema:", proximoMovimento);
        console.log("Movimento atual:", movimentoAtual);
        console.log("Todos os movimentos:", movimentosEsperados);

        // Tentar fazer o movimento diretamente do PGN
        try {
          novoGame.move(proximoMovimento);
          setGame(novoGame);
          setMovimentoAtual(movimentoAtual + 2); // Incrementa em 2 pois já aplicamos o movimento do usuário
          setFeedback("Sua vez de jogar!");
        } catch (e) {
          // Se falhar, tentar fazer o movimento usando a notação algébrica completa
          const movimentosPossiveis = novoGame.moves({ verbose: true });
          console.log("Movimentos possíveis:", movimentosPossiveis);

          // Tentar encontrar o movimento que corresponde ao esperado
          const movimentoEncontrado = movimentosPossiveis.find((m) => {
            const mNormalizado = normalizarMovimento(m.san);
            const proximoNormalizado = normalizarMovimento(proximoMovimento);
            console.log("Comparando:", mNormalizado, "com", proximoNormalizado);
            return mNormalizado === proximoNormalizado;
          });

          if (movimentoEncontrado) {
            novoGame.move(movimentoEncontrado);
            setGame(novoGame);
            setMovimentoAtual(movimentoAtual + 2); // Incrementa em 2 pois já aplicamos o movimento do usuário
            setFeedback("Sua vez de jogar!");
          } else {
            throw new Error("Movimento não encontrado");
          }
        }
      } catch (error) {
        console.error("Erro ao fazer movimento automático:", error);
        setFeedback("Erro ao processar movimento. Tente novamente.");
        setErro(true);
      }
    }
  };

  const normalizarMovimento = (mov: string) => {
    return mov
      .replace(/\+/g, "") // Remove checks
      .replace(/#/g, "") // Remove checkmates
      .replace(/=/g, "") // Remove promotions
      .replace(/x/g, "") // Remove captures
      .toLowerCase(); // Converte para minúsculo
  };

  const proximoExercicio = () => {
    if (exercicioAtual < exercicios.length - 1) {
      setExercicioAtual(exercicioAtual + 1);
      carregarExercicio(exercicios[exercicioAtual + 1]);
    } else {
      // Voltar para o primeiro exercício
      setExercicioAtual(0);
      carregarExercicio(exercicios[0]);
    }
  };

  const exercicioAnterior = () => {
    if (exercicioAtual > 0) {
      setExercicioAtual(exercicioAtual - 1);
      carregarExercicio(exercicios[exercicioAtual - 1]);
    }
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
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

      // Calcular o índice do movimento esperado
      // Posições pares (0, 2, 4...) são lances do usuário
      const indiceMovimentoEsperado = movimentoAtual;
      const movimentoEsperado = movimentosEsperados[indiceMovimentoEsperado];
      console.log("=== Debug de Movimentos ===");
      console.log("Usuário:", movimentoAtualSan);
      console.log("Movimento esperado:", movimentoEsperado);
      console.log("Índice atual:", movimentoAtual);
      console.log("Todos os movimentos:", movimentosEsperados);

      if (!movimentoEsperado) {
        console.error("Movimento esperado não encontrado");
        return false;
      }

      // Normalizar os movimentos para comparação
      const normalizarMovimento = (mov: string) => {
        return mov
          .replace(/\+/g, "") // Remove checks
          .replace(/#/g, "") // Remove checkmates
          .replace(/=/g, "") // Remove promotions
          .replace(/x/g, "") // Remove captures
          .toLowerCase(); // Converte para minúsculo
      };

      const movimentoAtualNormalizado = normalizarMovimento(movimentoAtualSan);
      const movimentoEsperadoNormalizado =
        normalizarMovimento(movimentoEsperado);

      if (movimentoAtualNormalizado === movimentoEsperadoNormalizado) {
        // Movimento correto, atualizar o jogo real
        setGame(gameCopy);
        setErro(false);
        setMovimentoAtual(movimentoAtual + 1);

        // Verificar se é o último movimento do usuário
        const ehUltimoMovimentoUsuario =
          indiceMovimentoEsperado === movimentosEsperados.length - 1;

        if (ehUltimoMovimentoUsuario) {
          // Último movimento correto
          setFeedback("Parabéns! Você completou o exercício!");
          // Adicionar um pequeno delay antes de mostrar o verde
          setTimeout(() => {
            setCasaSucesso(targetSquare);
            setTimeout(() => {
              setCasaSucesso(null);
              proximoExercicio();
            }, 1500);
          }, 300);
        } else {
          // Movimento correto, mas ainda não é o último
          setFeedback("Boa! Mas ainda não acabou...");
          // Fazer o movimento automático do oponente
          setTimeout(fazerMovimentoAutomatico, 1000);
        }
      } else {
        // Movimento incorreto, mas mantemos no tabuleiro
        setGame(gameCopy);
        setCasaErro(targetSquare);
        setTimeout(() => {
          setFeedback("Movimento incorreto.");
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

  const onDropEnd = (sourceSquare: Square, targetSquare: Square) => {
    // Verificar se é o último movimento do usuário
    const ehUltimoMovimentoUsuario =
      movimentoAtual === movimentosEsperados.length - 1;

    if (ehUltimoMovimentoUsuario) {
      setCasaSucesso(targetSquare);
      setTimeout(() => {
        setCasaSucesso(null);
      }, 1500);
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

  // Determinar de quem é a vez baseado no movimento atual e na cor do usuário
  const vezDeQuem = () => {
    const ehVezDoUsuario = movimentoAtual % 2 === 0;
    return primeiroLanceNegras
      ? ehVezDoUsuario
        ? "Lance das pretas"
        : "Lance das brancas"
      : ehVezDoUsuario
      ? "Lance das brancas"
      : "Lance das pretas";
  };

  const onSquareClick = (square: Square) => {
    // Se não houver peça selecionada e houver uma peça no quadrado clicado
    if (!pecaSelecionada && game.get(square)) {
      const movimentos = game.moves({ square, verbose: true });
      if (movimentos.length > 0) {
        setPecaSelecionada(square);
        setMovimentosPossiveis(movimentos.map((m) => m.to as Square));
      }
      return;
    }

    // Se já houver uma peça selecionada
    if (pecaSelecionada) {
      // Se clicar na mesma peça, deseleciona
      if (square === pecaSelecionada) {
        setPecaSelecionada(null);
        setMovimentosPossiveis([]);
        return;
      }

      // Se clicar em um movimento possível
      if (movimentosPossiveis.includes(square)) {
        onDrop(pecaSelecionada, square);
        setPecaSelecionada(null);
        setMovimentosPossiveis([]);
        return;
      }

      // Se clicar em outra peça da mesma cor
      const pecaAtual = game.get(pecaSelecionada);
      const pecaClicada = game.get(square);
      if (pecaClicada && pecaAtual && pecaClicada.color === pecaAtual.color) {
        const movimentos = game.moves({ square, verbose: true });
        if (movimentos.length > 0) {
          setPecaSelecionada(square);
          setMovimentosPossiveis(movimentos.map((m) => m.to as Square));
        }
        return;
      }

      // Se clicar em qualquer outro lugar, deseleciona
      setPecaSelecionada(null);
      setMovimentosPossiveis([]);
    }
  };

  return (
    <div className="App">
      <main>
        <div className="info">
          <p className="tema">Tema: {exercicios[exercicioAtual].titulo}</p>
          <p className="exercicio">
            Exercício: {exercicioAtual + 1} de {exercicios.length} - Nível:{" "}
            {exercicios[exercicioAtual].nivel}
          </p>
        </div>
        <div className="jogador-nome pretas">
          {exercicios[exercicioAtual].black}
        </div>
        <div className="chessboard-container">
          <Chessboard
            position={game.fen()}
            boardWidth={400}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            boardOrientation={orientacaoTabuleiro()}
            customSquareStyles={{
              ...(casaErro && {
                [casaErro]: {
                  backgroundColor: "rgba(255, 0, 0, 0.7)",
                },
              }),
              ...(casaSucesso && {
                [casaSucesso]: {
                  backgroundColor: "rgba(0, 255, 0, 0.4)",
                },
              }),
              ...(pecaSelecionada && {
                [pecaSelecionada]: {
                  backgroundColor: "rgba(255, 255, 0, 0.4)",
                },
              }),
              ...movimentosPossiveis.reduce(
                (acc, square) => ({
                  ...acc,
                  [square]: {
                    background: `radial-gradient(circle, ${
                      game.get(pecaSelecionada!)?.color === "w"
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(0, 0, 0, 0.4)"
                    } 25%, transparent 25%)`,
                  },
                }),
                {}
              ),
            }}
          />
        </div>
        <div className="jogador-nome brancas">
          {exercicios[exercicioAtual].white}
        </div>
        <div className="controls">
          <button onClick={exercicioAnterior} disabled={exercicioAtual === 0}>
            Anterior
          </button>
          <button
            onClick={proximoExercicio}
            disabled={exercicioAtual === exercicios.length - 1}
          >
            Próximo
          </button>
        </div>
        <div className="info">
          {feedback && (
            <div
              className={`feedback ${
                erro
                  ? "error"
                  : feedback.includes("Parabéns")
                  ? "success"
                  : "info"
              }`}
            >
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
