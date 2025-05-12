import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {RootStackParamList, Treino} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';

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
    const carregarTreinos = async () => {
      try {
        const key = `treinos_${aluno.email}`;
        const data = await AsyncStorage.getItem(key);
        const parsedTreinos = data ? JSON.parse(data) : [];
        setTreinos(parsedTreinos);
      } catch (error) {
        console.error('Erro ao carregar treinos:', error);
        Alert.alert('Erro', 'Não foi possível carregar os treinos.');
      }
    };

    carregarTreinos();
  }, [aluno.email]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treinos de {aluno.nome}</Text>

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
