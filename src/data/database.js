import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {name: 'FitnessLifeDB.db', location: 'default'},
  () => console.log('✅ Database connected'),
  error => console.error('❌ Database error', error),
);

const initDB = () => {
  db.transaction(tx => {
    // Tabela de usuários (professores e alunos)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        isProfessor INTEGER DEFAULT 0,
        cref TEXT
      );`,
      [],
      () => console.log('Tabela users criada/verificada'),
      (_, error) => console.error('Erro ao criar tabela users:', error),
    );

    // Tabela de treinos com campo professor_email
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_email TEXT NOT NULL,
        nomeTreino TEXT NOT NULL,
        data TEXT NOT NULL,
        calorias INTEGER DEFAULT 0,
        ordem INTEGER DEFAULT 0,
        professor_email TEXT,
        FOREIGN KEY (aluno_email) REFERENCES users(email) ON DELETE CASCADE
      );`,
      [],
      () => console.log('Tabela treinos criada/verificada'),
      (_, error) => console.error('Erro ao criar tabela treinos:', error),
    );

    // Tentativa de adicionar a coluna professor_email caso já exista a tabela (evita erro na migração)
    tx.executeSql(
      `ALTER TABLE treinos ADD COLUMN professor_email TEXT;`,
      [],
      () => console.log('Coluna professor_email adicionada na tabela treinos'),
      (txObj, error) => {
        if (!error.message.includes('duplicate column name')) {
          console.error('Erro ao adicionar professor_email:', error);
        }
      },
    );

    // Tabela de grupos musculares
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS grupos_musculares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL
      );`,
      [],
      () => console.log('Tabela grupos_musculares criada/verificada'),
      (_, error) => console.error('Erro grupos_musculares:', error),
    );
    // Tabela de treinos finalizados
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS treinos_finalizados (
      aluno_email TEXT NOT NULL,
      treino_id INTEGER NOT NULL,
      PRIMARY KEY (aluno_email, treino_id)
  );`,
      [],
      () => console.log('Tabela treinos_finalizados criada/verificada'),
      (_, error) => console.error('Erro treinos_finalizados:', error),
    );
    // Tabela de progresso do aluno
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS progresso_aluno (
      aluno_email TEXT PRIMARY KEY,
      ultimo_treino_ordem INTEGER DEFAULT 0,
      data_ultimo_treino TEXT
  );`,
      [],
      () => console.log('Tabela progresso_aluno criada/verificada'),
      (_, error) => console.error('Erro progresso_aluno:', error),
    );

    // Tabela de exercícios
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS exercicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        treino_id INTEGER NOT NULL,
        grupo_muscular_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        series INTEGER DEFAULT 3,
        repeticoes INTEGER DEFAULT 12,
        pausa INTEGER DEFAULT 60,
        FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
        FOREIGN KEY (grupo_muscular_id) REFERENCES grupos_musculares(id)
      );`,
      [],
      () => console.log('Tabela exercicios criada/verificada'),
      (_, error) => console.error('Erro exercicios:', error),
    );

    // Inserção inicial de grupos musculares
    tx.executeSql(
      `INSERT OR IGNORE INTO grupos_musculares (nome) VALUES 
        ('Peito'), ('Costas'), ('Pernas'), 
        ('Ombros'), ('Bíceps'), ('Tríceps'), ('Abdômen');`,
      [],
      () => console.log('Grupos musculares inseridos'),
      (_, error) => console.error('Erro ao inserir grupos:', error),
    );
  });
};

// Serviço para exercícios
const ExercicioService = {
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
