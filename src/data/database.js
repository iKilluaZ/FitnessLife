import SQLite from 'react-native-sqlite-storage';

// Configuração do banco
const db = SQLite.openDatabase(
  {name: 'FitnessLifeDB.db', location: 'default'},
  () => console.log('Database connected'),
  error => console.error('Database error', error),
);

// Inicializa todas as tabelas
const initDB = () => {
  db.transaction(tx => {
    // Tabela de usuários
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isProfessor BOOLEAN DEFAULT 0,
        cref TEXT
      );`,
    );

    // Tabela de treinos
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_email TEXT NOT NULL,
        nomeTreino TEXT NOT NULL,
        data TEXT NOT NULL,
        calorias INTEGER DEFAULT 0,
        FOREIGN KEY (aluno_email) REFERENCES users(email) ON DELETE CASCADE
      );`,
    );

    // Tabela de grupos musculares (nova tabela)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS grupos_musculares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL
      );`,
    );

    // Tabela de exercícios (com agrupamento muscular)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS exercicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        treino_id INTEGER NOT NULL,
        grupo_muscular_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        series INTEGER DEFAULT 3,
        repeticoes INTEGER DEFAULT 12,
        pausa INTEGER DEFAULT 60,  // em segundos
        FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
        FOREIGN KEY (grupo_muscular_id) REFERENCES grupos_musculares(id)
      );`,
    );

    // Insere grupos musculares padrão
    tx.executeSql(
      `INSERT OR IGNORE INTO grupos_musculares (nome) VALUES 
        ('Peito'), ('Costas'), ('Pernas'), 
        ('Ombros'), ('Bíceps'), ('Tríceps'), ('Abdômen');`,
    );
  });
};

// Métodos para exercícios
const ExercicioService = {
  // Adiciona um novo exercício
  addExercicio: exercicio => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO exercicios 
          (treino_id, grupo_muscular_id, nome, series, repeticoes, pausa) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            exercicio.treinoId,
            exercicio.grupoMuscularId,
            exercicio.nome,
            exercicio.series,
            exercicio.repeticoes,
            exercicio.pausa,
          ],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error),
        );
      });
    });
  },

  // Busca exercícios por treino
  getExerciciosByTreino: treinoId => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT e.*, gm.nome as grupo_muscular 
          FROM exercicios e
          JOIN grupos_musculares gm ON e.grupo_muscular_id = gm.id
          WHERE e.treino_id = ?`,
          [treinoId],
          (_, result) => {
            const exercicios = [];
            for (let i = 0; i < result.rows.length; i++) {
              exercicios.push(result.rows.item(i));
            }
            resolve(exercicios);
          },
        );
      });
    });
  },

  // Busca todos os grupos musculares
  getGruposMusculares: () => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM grupos_musculares', [], (_, result) => {
          const grupos = [];
          for (let i = 0; i < result.rows.length; i++) {
            grupos.push(result.rows.item(i));
          }
          resolve(grupos);
        });
      });
    });
  },
};

export {db, initDB, ExercicioService};
