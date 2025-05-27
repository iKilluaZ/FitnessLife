import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList, Treino} from '../types';

type DetalhesRouteProp = RouteProp<RootStackParamList, 'DetalhesTreino'>;

const DetalhesTreino = () => {
  const route = useRoute<DetalhesRouteProp>();
  const treino: Treino | undefined = route.params?.treino;

  if (!treino) {
    return (
      <View style={styles.centered}>
        <Text>Treino não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{treino.nomeTreino}</Text>
        <Text style={styles.data}>Data: {treino.data}</Text>
        <Text style={styles.subtitulo}>Exercícios:</Text>
        {treino.exercicios?.map((ex, i) => (
          <Text key={i} style={styles.exercicio}>
            • {ex.nome} — {ex.series}x{ex.repeticoes} ({ex.pausa}s)
          </Text>
        ))}
      </View>
    </View>
  );
};

export default DetalhesTreino;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
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
