import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {db} from '../data/database';

type Aluno = {
  id: number;
  nome: string;
  email: string;
  isProfessor: number;
};

const TelaProfessor = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const fetchAlunos = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE isProfessor = 0',
        [],
        (_, {rows}) => {
          const lista: Aluno[] = [];
          for (let i = 0; i < rows.length; i++) {
            lista.push(rows.item(i));
          }
          setAlunos(lista);
        },
        (_, error) => {
          console.error('Erro ao buscar alunos:', error);
          Alert.alert('Erro', 'Não foi possível buscar os alunos.');
          return false;
        },
      );
    });
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleMontarTreino = (aluno: Aluno) => {
    navigation.navigate('MontarTreino', {
      aluno: {nome: aluno.nome, email: aluno.email},
    });
  };

  const handleExcluirAluno = (aluno: Aluno) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja excluir o aluno ${aluno.nome}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM users WHERE email = ?',
                [aluno.email],
                () => {
                  fetchAlunos();
                  Alert.alert('Sucesso', `Aluno ${aluno.nome} excluído.`);
                },
                (_, error) => {
                  console.error('Erro ao excluir aluno:', error);
                  Alert.alert('Erro', 'Falha ao excluir aluno.');
                  return false;
                },
              );
            });
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleVisualizarTreinos = (aluno: Aluno) => {
    navigation.navigate('VisualizarTreinos', {
      aluno: {nome: aluno.nome, email: aluno.email},
    });
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () =>
          navigation.reset({
            index: 0,
            routes: [{name: 'LoginCadastro'}],
          }),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Alunos Cadastrados</Text>

      {alunos.length === 0 ? (
        <Text style={styles.noAlunosText}>Nenhum aluno cadastrado.</Text>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={item => item.email}
          renderItem={({item}) => (
            <View style={styles.alunoCard}>
              <View>
                <Text style={styles.alunoName}>{item.nome}</Text>
                <Text style={styles.alunoEmail}>{item.email}</Text>
              </View>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleMontarTreino(item)}>
                  <Text style={styles.buttonText}>Montar Treino</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleVisualizarTreinos(item)}>
                  <Text style={styles.buttonText}>Ver Treinos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleExcluirAluno(item)}>
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TelaProfessor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoutButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noAlunosText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  alunoCard: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f4f4f4',
    marginBottom: 10,
  },
  alunoName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alunoEmail: {
    color: '#555',
    fontSize: 13,
    marginBottom: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});
