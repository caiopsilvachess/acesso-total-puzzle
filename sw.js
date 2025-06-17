/* eslint-disable no-restricted-globals */

// Service Worker configurado para sempre buscar versão mais recente
// Sem cache que possa deixar versões desatualizadas

const CACHE_NAME = "acesso-total-puzzle-v1";

// Instalação do Service Worker - apenas para registro
self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
  // Não cachear nada na instalação
  self.skipWaiting();
});

// Interceptação de requisições - sempre buscar da rede
self.addEventListener("fetch", (event) => {
  // Para requisições de navegação (páginas), sempre buscar da rede
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Se falhar, retorna uma página de erro offline simples
        return new Response(
          `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Offline - Acesso Total Puzzle</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: #f0f0f0; 
                  }
                  .offline-message { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
                    max-width: 400px; 
                    margin: 0 auto; 
                  }
                </style>
              </head>
              <body>
                <div class="offline-message">
                  <h2>📶 Sem Conexão</h2>
                  <p>Você está offline. Conecte-se à internet para acessar o Acesso Total Puzzle.</p>
                  <button onclick="window.location.reload()">Tentar Novamente</button>
                </div>
              </body>
            </html>
          `,
          {
            headers: { "Content-Type": "text/html" },
          }
        );
      })
    );
    return;
  }

  // Para outros recursos (CSS, JS, imagens), sempre buscar da rede
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, retorna diretamente
        if (response && response.status === 200) {
          return response;
        }
        throw new Error("Resposta inválida");
      })
      .catch((error) => {
        console.log("Falha na busca da rede:", error);
        // Para recursos estáticos, retorna uma resposta vazia ou erro
        if (
          event.request.destination === "script" ||
          event.request.destination === "style" ||
          event.request.destination === "image"
        ) {
          return new Response("", { status: 404 });
        }
        throw error;
      })
  );
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker ativado");
  // Limpar qualquer cache antigo se existir
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log("Removendo cache antigo:", cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Tomar controle imediatamente
  event.waitUntil(self.clients.claim());
});

// Interceptação de mensagens
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
