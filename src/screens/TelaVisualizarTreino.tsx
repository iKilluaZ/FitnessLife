import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {RootStackParamList, Treino, Exercicio} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';
import {db} from '../data/database';

type VisualizarTreinosRouteProp = RouteProp<
  RootStackParamList,
  'VisualizarTreinos'
>;

const TelaVisualizarTreinos = () => {
  const route = useRoute<VisualizarTreinosRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {aluno} = route.params;

  const [treinos, setTreinos] = useState<Treino[]>([]);

  useEffect(() => {
    if (aluno?.email) {
      carregarTreinosDoBanco(aluno.email);
    }
  }, [aluno.email]);

  const carregarTreinosDoBanco = (email: string) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM treinos WHERE aluno_email = ? ORDER BY data DESC',
        [email],
        (_, result) => {
          const treinosCarregados: Treino[] = [];

          const processarProximo = (index: number) => {
            if (index >= result.rows.length) {
              setTreinos(treinosCarregados);
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

                treinosCarregados.push({
                  nomeTreino: row.nomeTreino,
                  data: row.data,
                  calorias: row.calorias || 0,
                  exercicios,
                });

                processarProximo(index + 1);
              },
              (_, err) => {
                console.error('Erro ao carregar exercícios:', err);
                processarProximo(index + 1);
                return false;
              },
            );
          };

          processarProximo(0);
        },
        (_, error) => {
          console.error('Erro ao buscar treinos do banco:', error);
          Alert.alert('Erro', 'Não foi possível carregar os treinos.');
          return false;
        },
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todos os Treinos de {aluno.nome}</Text>

      {treinos.length === 0 ? (
        <Text style={styles.noTreinoText}>Nenhum treino encontrado.</Text>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={(item, index) =>
            `${item.nomeTreino}-${item.data}-${index}`
          }
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nomeTreino}</Text>
              <Text style={styles.cardDate}>Data: {item.data}</Text>
              <Text style={styles.cardInfo}>
                Exercícios: {item.exercicios.length}
              </Text>
              <Text style={styles.cardInfo}>
                Calorias estimadas: {item.calorias}
              </Text>
            </View>
          )}
          contentContainerStyle={{paddingBottom: 20}}
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
  backButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
