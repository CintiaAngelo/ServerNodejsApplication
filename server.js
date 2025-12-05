const http = require("http");
const url = require("url");

const porta = 4000;
let dados = [];

const servidor = http.createServer(async (req, res) => {
  const urlFinal = url.parse(req.url, true);

  //CORS para o navegador
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

//url
  if (urlFinal.pathname === "/") {
    if (req.method === "GET") {
      res.end(JSON.stringify(dados));
    }

    if (req.method === "POST") {
      try {
        const body = await getBody(req);
        dados.push(body);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ mensagem: "Item adicionado", item: body }));
      } catch (erro) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "JSON inválido" }));
      }
    }

    if (req.method === "PUT") {
      try {
        const id = urlFinal.query.id;
        if (id === undefined || id >= dados.length) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ erro: "Item não encontrado" }));
          return;
        }

        const body = await getBody(req);
        dados[id] = body;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ mensagem: "Item atualizado", item: body }));
      } catch (erro) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "JSON inválido" }));
      }
    }

    if (req.method === "DELETE") {
      const id = urlFinal.query.id;
      if (id === undefined || id >= dados.length) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "Item não encontrado" }));
        return;
      }
      const removido = dados.splice(id, 1);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ mensagem: "Item removido", item: removido }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ erro: "Rota não encontrada" }));
  }
});

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

servidor.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
