import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList, Treino, Exercicio} from '../types';
import SQLite from 'react-native-sqlite-storage';

const dbPromise = SQLite.openDatabase({
  name: 'FitnessLifeDB.db',
  location: 'default',
});

type DetalhesRouteProp = RouteProp<RootStackParamList, 'DetalhesTreino'>;

const DetalhesTreino = () => {
  const route = useRoute<DetalhesRouteProp>();
  const navigation = useNavigation();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alunoEmail = route.params?.alunoEmail;

    if (!alunoEmail) return;

    (async () => {
      const db = await dbPromise;
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM treinos WHERE aluno_email = ? ORDER BY data DESC`,
          [alunoEmail],
          (_, result) => {
            const treinosList: Treino[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              treinosList.push(result.rows.item(i));
            }
            setTreinos(treinosList);
            setLoading(false);
          },
        );
      });
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Carregando treinos...</Text>
      </View>
    );
  }

  if (treinos.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Nenhum treino encontrado.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={treinos}
      keyExtractor={item => item.data}
      contentContainerStyle={styles.container}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.titulo}>{item.nomeTreino}</Text>
          <Text style={styles.data}>Data: {item.data}</Text>
          <Text style={styles.subtitulo}>Exercícios:</Text>
          {item.exercicios?.map((ex, i) => (
            <Text key={i} style={styles.exercicio}>
              • {ex.nome} — {ex.series}x{ex.repeticoes} ({ex.pausa}s)
            </Text>
          ))}
        </View>
      )}
    />
  );
};

export default DetalhesTreino;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subtitulo: {
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  exercicio: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
