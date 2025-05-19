// src/screens/TreinoDoDia.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {RootStackParamList, Treino} from '../types';
import {db} from '../data/database';

type TreinoDoDiaRouteProp = RouteProp<RootStackParamList, 'TreinoDoDia'>;

const TreinoDoDia = () => {
  const route = useRoute<TreinoDoDiaRouteProp>();
  const navigation = useNavigation();
  const aluno = route.params?.aluno;

  if (!aluno) {
    return (
      <View style={styles.container}>
        <Text style={styles.semTreino}>Dados do aluno não encontrados.</Text>
        <TouchableOpacity
          style={styles.voltarButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.voltarText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);

  useEffect(() => {
    const carregarTreino = async () => {
      try {
        const hoje = new Date().toISOString().split('T')[0];
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM treinos WHERE aluno_email = ? AND data = ?',
            [aluno.email, hoje],
            (_, result) => {
              if (result.rows.length > 0) {
                const treino = result.rows.item(0);
                // Buscar os exercícios associados
                tx.executeSql(
                  'SELECT * FROM exercicios WHERE treino_id = ?',
                  [treino.id],
                  (_, exResult) => {
                    const exercicios = [];
                    for (let i = 0; i < exResult.rows.length; i++) {
                      exercicios.push(exResult.rows.item(i));
                    }

                    setTreinoHoje({
                      nomeTreino: treino.nomeTreino,
                      data: treino.data,
                      calorias: treino.calorias,
                      exercicios,
                    });
                  },
                );
              } else {
                setTreinoHoje(null);
              }
            },
          );
        });
      } catch (error) {
        console.error('Erro ao carregar treino do dia:', error);
        Alert.alert('Erro', 'Não foi possível carregar o treino de hoje.');
      }
    };

    carregarTreino();
  }, [aluno.email]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treino do Dia</Text>

      {treinoHoje ? (
        <>
          <Text style={styles.nomeTreino}>{treinoHoje.nomeTreino}</Text>
          <FlatList
            data={treinoHoje.exercicios}
            keyExtractor={(item, index) => `${item.nome}-${index}`}
            renderItem={({item}) => (
              <View style={styles.exercicioCard}>
                <Text style={styles.exercicioNome}>{item.nome}</Text>
                <Text>
                  {item.series} séries de {item.repeticoes} repetições
                </Text>
                <Text>Pausa: {item.pausa} segundos</Text>
              </View>
            )}
          />
        </>
      ) : (
        <Text style={styles.semTreino}>Nenhum treino marcado para hoje.</Text>
      )}

      <TouchableOpacity
        style={styles.voltarButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.voltarText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TreinoDoDia;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nomeTreino: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 16,
  },
  exercicioCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  exercicioNome: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  semTreino: {
    fontSize: 16,
    color: '#666',
    marginTop: 40,
    textAlign: 'center',
  },
  voltarButton: {
    backgroundColor: '#007bff',
    marginTop: 30,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  voltarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
