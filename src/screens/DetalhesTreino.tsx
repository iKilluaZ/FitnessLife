import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';

type DetalhesTreinoRouteProp = RouteProp<RootStackParamList, 'DetalhesTreino'>;

const DetalhesTreino = () => {
  const route = useRoute<DetalhesTreinoRouteProp>();
  const {treino} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{treino.nomeTreino}</Text>

      <FlatList
        data={treino.exercicios}
        keyExtractor={(item, index) => `${item.nome}-${index}`}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.nomeExercicio}>{item.nome}</Text>
            <Text style={styles.detalhes}>
              Séries: {item.series} | Repetições: {item.repeticoes}
            </Text>
            <Text style={styles.detalhes}>Pausa: {item.pausa} seg</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.semDados}>Nenhum exercício encontrado.</Text>
        }
      />
    </View>
  );
};

export default DetalhesTreino;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  nomeExercicio: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detalhes: {
    fontSize: 14,
    color: '#666',
  },
  semDados: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 16,
  },
});
