import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList, Treino, Exercicio} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';
import SQLite from 'react-native-sqlite-storage';
import {db} from '../data/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VisualizarTreinosRouteProp = RouteProp<
  RootStackParamList,
  'VisualizarTreinos'
>;

const TelaVisualizarTreinos = ({
  route,
}: {
  route: VisualizarTreinosRouteProp;
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {aluno} = route.params;
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [usuarioIsProfessor, setUsuarioIsProfessor] = useState(false);

  useEffect(() => {
    const carregarUsuario = async () => {
      const email = await AsyncStorage.getItem('usuarioLogado');
      if (!email) return;
      setUsuarioEmail(email);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT isProfessor FROM users WHERE email = ?',
          [email],
          (_, result) => {
            if (result.rows.length > 0) {
              const isProf = result.rows.item(0).isProfessor === 1;
              setUsuarioIsProfessor(isProf);
            }
          },
        );
      });
    };

    carregarUsuario();
  }, []);

  useEffect(() => {
    if (aluno?.email) {
      carregarTreinosAluno();
    }
  }, [aluno]);

  const carregarTreinosAluno = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM treinos WHERE aluno_email = ?',
        [aluno.email],
        (_, result) => {
          const treinosTemp: Treino[] = [];

          const carregarExercicios = (index: number) => {
            if (index >= result.rows.length) {
              setTreinos(treinosTemp);
              return;
            }

            const row = result.rows.item(index);
            const treinoId = row.id;

            tx.executeSql(
              `SELECT e.*, gm.nome as grupoMuscular 
               FROM exercicios e
               JOIN grupos_musculares gm ON e.grupo_muscular_id = gm.id
               WHERE e.treino_id = ?`,
              [treinoId],
              (_, exResult) => {
                const exercicios: Exercicio[] = [];
                for (let i = 0; i < exResult.rows.length; i++) {
                  exercicios.push(exResult.rows.item(i));
                }

                treinosTemp.push({
                  id: row.id,
                  aluno_email: row.aluno_email,
                  nomeTreino: row.nomeTreino,
                  data: row.data,
                  calorias: row.calorias,
                  exercicios,
                });

                carregarExercicios(index + 1);
              },
              (_, error) => {
                console.error('Erro ao carregar exercícios:', error);
                carregarExercicios(index + 1);
                return false;
              },
            );
          };

          carregarExercicios(0);
        },
        (_, error) => {
          console.error('Erro ao carregar treinos:', error);
          Alert.alert('Erro', 'Não foi possível carregar os treinos.');
          return false;
        },
      );
    });
  };

  const editarTreino = (treino: Treino) => {
    navigation.navigate('MontarTreino', {aluno, treino});
  };

  const excluirTreino = (treinoId: number) => {
    Alert.alert('Confirmar Exclusão', 'Deseja excluir este treino?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          db.transaction(tx => {
            tx.executeSql(
              'DELETE FROM treinos WHERE id = ?',
              [treinoId],
              () => {
                Alert.alert('Sucesso', 'Treino excluído.');
                carregarTreinosAluno();
              },
              (_, error) => {
                console.error('Erro ao excluir treino:', error);
                Alert.alert('Erro', 'Erro ao excluir o treino.');
                return false;
              },
            );
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treinos de {aluno?.nome}</Text>

      {treinos.length === 0 ? (
        <Text style={styles.noTreinoText}>Nenhum treino encontrado.</Text>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={item => `${item.id}`}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nomeTreino}</Text>
              <Text style={styles.cardDate}>Data: {item.data}</Text>
              <Text style={styles.cardInfo}>
                Exercícios: {item.exercicios?.length || 0}
              </Text>

              {usuarioIsProfessor && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editarTreino(item)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      item.id !== undefined && excluirTreino(item.id)
                    }>
                    <Text style={styles.editButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaVisualizarTreinos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noTreinoText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#555',
  },
  cardInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
