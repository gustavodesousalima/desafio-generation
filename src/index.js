const express = require('express');
const cors = require('cors')
const { Pool } = require('pg');
// import swaggerJSDoc from 'swagger-jsdoc';
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');
require('dotenv').config();

const PORT = process.env.PORT || 3333;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

const app = express();

app.use(express.json());
app.use(cors)

// // Configuração do Swagger
// const swaggerOptions = {
//     definition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'API de Alunos',
//             version: '1.0.0',
//             description: 'Documentação da API de Alunos',
//         },
//     },
//     apis: ['./index.js'], // Caminho para o arquivo que contém suas rotas
// };

// const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get('/', (req, res) => { console.log('Olá mundo') });

app.get('/alunos', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM alunos')
        return res.status(200).send(rows)
    } catch (error) {
        return res.status(400).send(error)
    }
});

  app.get('/alunos/:aluno_id', async (req, res) => {
    const { aluno_id } = req.params;
  
    try {
      const aluno = await pool.query('SELECT * FROM alunos WHERE aluno_id = ($1)', [aluno_id]);
  
      if (aluno.rows.length > 0) {
        res.json(aluno.rows[0]);
      } else {
        res.status(404).json({ mensagem: 'Aluno não foi encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
  });

  app.post('/aluno', async (req, res) => {
    const { aluno_name, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala } = req.body;
  
    try {
      const aluno = await pool.query('INSERT INTO alunos (aluno_name, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [aluno_name, idade, nota_primeiro_semestre, nota_segundo_semestre, nome_professor, numero_sala]);
  
      res.status(201).json(aluno.rows[0]); // Retorna os dados do novo aluno inserido
    } catch (error) {
      console.error('Erro ao criar novo aluno:', error);
      res.status(400).json({ mensagem: 'Erro ao criar novo aluno' });
    }
  });
  
  app.patch('/aluno/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
    const data = req.body;
  
    try {
      const updateAluno = await pool.query(`
        UPDATE alunos
        SET aluno_name = ($1), idade = ($2), nota_primeiro_semestre = ($3), nota_segundo_semestre = ($4), nome_professor = ($5), numero_sala = ($6)
        WHERE aluno_id = ($7)
      `, [data.aluno_name, data.idade, data.nota_primeiro_semestre, data.nota_segundo_semestre, data.nome_professor, data.numero_sala, alunoId]);
  
      res.status(200).json(updateAluno.rows); // Retorna os dados atualizados
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
  });
  
  app.delete('/aluno/:id', async (req, res) => {
    const alunoId = parseInt(req.params.id, 10);
  
    try {
      const alunoDeletado = await pool.query('DELETE FROM alunos WHERE aluno_id = ($1)', [alunoId]);
      res.status(200).json({ mensagem: 'Aluno apagado com sucesso' });
      alunoDeletado: alunoDeletado.rows;
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
  });
  
  app.listen(PORT, () => console.log(`Server rodando na porta: ${PORT}`));
  