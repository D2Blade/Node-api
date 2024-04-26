// app.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('api.db'); // Usando um banco de dados na memória para este exemplo

// Criação da tabela de clientes
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf INTEGER NOT NULL UNIQUE
  )`);
});

app.use(bodyParser.json());

// Rotas para cliente: Listar todos os clientes
const listaRotas = () => {
  const rotas = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      const path = middleware.route.path;
      rotas.push(`${method}: ${path}`);
    }
  });
  return rotas;
};

app.get('/', (req, res) => {
    const rotas = listaRotas();
    res.send('Rotas Disponiveis:\n' + rotas.join('\n'));
    });

//crud
app.get('/clientes', (req, res) => {
  db.all('SELECT * FROM clientes', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

//post
app.post('/clientes', (req, res) => {
  const { nome, cpf } = req.body;

//verificando se existe o cpf adicionado
  db.get('SELECT * FROM clientes WHERE cpf = ?', cpf, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.status(400).json({ error: 'O CPF '+ cpf + ' Já Existe' });
      return;
    }

    // Insere o cliente se o nome não existir
    db.run('INSERT INTO clientes (nome, cpf) VALUES (?, ?)', [nome, cpf], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, nome, cpf });
    });
  });
});

//PUT
app.put('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cpf } = req.body;
  db.run('UPDATE clientes SET nome = ?, cpf = ? WHERE id = ?', [nome, cpf, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, nome, cpf , message: 'Cliente atualizado com sucesso.'});
  });
});

//DELETE
app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM clientes WHERE id = ?', id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Cliente excluído com sucesso.', id });
  });
});

// math_route
app.get('/soma/:a/:b', (req, res) => {
  const { a, b } = req.params;
  const resultado = parseFloat(a) + parseFloat(b);
  res.json({ resultado });
});

app.get('/subtracao/:a/:b', (req, res) => {
  const { a, b } = req.params;
  const resultado = parseFloat(a) - parseFloat(b);
  res.json({ resultado });
});

app.get('/multiplicacao/:a/:b', (req, res) => {
  const { a, b } = req.params;
  const resultado = parseFloat(a) * parseFloat(b);
  res.json({ resultado });
});

app.get('/divisao/:a/:b', (req, res) => {
  const { a, b } = req.params;
  if (parseFloat(b) === 0) {
    res.status(400).json({ error: 'Não é possível dividir por zero.' });
    return;
  }
  const resultado = parseFloat(a) / parseFloat(b);
  res.json({ resultado });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
