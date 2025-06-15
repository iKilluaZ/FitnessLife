import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList, Treino, Aluno} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';
import {db} from '../data/database';

type VisualizarTreinosRouteProp = RouteProp<
  RootStackParamList,
  'VisualizarTreinos'
>;

const TelaVisualizarTreino = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<VisualizarTreinosRouteProp>();
  const {aluno, isProfessor} = route.params;

  const [treinos, setTreinos] = useState<Treino[]>([]);

  useEffect(() => {
    buscarTreinos();
  }, []);

  const buscarTreinos = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM treinos WHERE aluno_email = ? ORDER BY id DESC',
        [aluno.email],
        (_, result) => {
          const treinosList: Treino[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            treinosList.push(result.rows.item(i));
          }
          setTreinos(treinosList);
        },
        (_, error) => {
          console.error('Erro ao buscar treinos:', error);
          return false;
        },
      );
    });
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
                Alert.alert('Sucesso', 'Treino excluído com sucesso');
                buscarTreinos();
              },
              (_, error) => {
                console.error('Erro ao excluir treino:', error);
                return false;
              },
            );
          });
        },
      },
    ]);
  };

  const abrirEdicao = (treino: Treino) => {
    navigation.navigate('MontarTreino', {aluno, treino});
  };

  const renderItem = ({item}: {item: Treino}) => (
    <View style={styles.card}>
      <Text style={styles.nomeTreino}>{item.nomeTreino}</Text>
      <Text style={styles.dataTreino}>Data: {item.data}</Text>
      <Text style={styles.calorias}>Calorias: {item.calorias}</Text>

      {isProfessor && (
        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botao, {backgroundColor: '#28a745'}]}
            onPress={() => abrirEdicao(item)}>
            <Text style={styles.textoBotao}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, {backgroundColor: '#dc3545'}]}
            onPress={() => excluirTreino(item.id!)}>
            <Text style={styles.textoBotao}>Excluir</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={treinos}
      renderItem={renderItem}
      keyExtractor={item => item.id!.toString()}
      ListHeaderComponent={() => (
        <Text style={styles.titulo}>Treinos de {aluno.nome}</Text>
      )}
      ListEmptyComponent={() => (
        <Text style={styles.nenhumTreino}>Nenhum treino encontrado.</Text>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

export default TelaVisualizarTreino;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  nomeTreino: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  dataTreino: {
    fontSize: 14,
    color: '#555',
  },
  calorias: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botao: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nenhumTreino: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 30,
  },
});
