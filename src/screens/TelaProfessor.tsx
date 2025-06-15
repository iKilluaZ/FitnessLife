import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, Aluno} from '../types';
import {db} from '../data/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TelaProfessor = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);

  useEffect(() => {
    carregarAlunos();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredAlunos(alunos);
    } else {
      const filtro = alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredAlunos(filtro);
    }
  }, [searchText, alunos]);

  const carregarAlunos = async () => {
    setLoading(true);
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE isProfessor = 0',
          [],
          (_, result) => {
            const lista: Aluno[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              lista.push(result.rows.item(i));
            }
            setAlunos(lista);
            setFilteredAlunos(lista);
            setLoading(false);
          },
          (_, error) => {
            console.error('Erro ao buscar alunos:', error);
            setLoading(false);
            return false;
          },
        );
      });
    } catch (error) {
      console.error('Erro geral:', error);
      setLoading(false);
    }
  };

  const excluirAluno = (email: string) => {
    Alert.alert('Excluir Aluno', 'Tem certeza que deseja excluir este aluno?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          db.transaction(tx => {
            tx.executeSql(
              'DELETE FROM users WHERE email = ?',
              [email],
              () => {
                Alert.alert('Sucesso', 'Aluno excluído com sucesso.');
                carregarAlunos();
              },
              (_, error) => {
                console.error('Erro ao excluir aluno:', error);
                Alert.alert('Erro', 'Não foi possível excluir o aluno.');
                return false;
              },
            );
          });
        },
      },
    ]);
  };

  const abrirMontarTreino = (aluno: Aluno) => {
    navigation.navigate('MontarTreino', {aluno});
  };

  const abrirVisualizarTreinos = (aluno: Aluno) => {
    navigation.navigate('VisualizarTreinos', {aluno, isProfessor: true});
  };

  const sair = async () => {
    await AsyncStorage.removeItem('usuarioLogado');
    navigation.reset({index: 0, routes: [{name: 'LoginCadastro'}]});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alunos Cadastrados</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar aluno pelo nome..."
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : filteredAlunos.length === 0 ? (
        <Text style={styles.noAlunos}>Nenhum aluno encontrado.</Text>
      ) : (
        <FlatList
          data={filteredAlunos}
          keyExtractor={item => item.email}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.alunoNome}>{item.nome}</Text>
              <Text style={styles.alunoEmail}>{item.email}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => abrirMontarTreino(item)}>
                  <Text style={styles.buttonText}>Montar Treino</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#28a745'}]}
                  onPress={() => abrirVisualizarTreinos(item)}>
                  <Text style={styles.buttonText}>Ver Treinos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, {backgroundColor: '#dc3545'}]}
                  onPress={() => excluirAluno(item.email)}>
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={sair}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaProfessor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8ff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e3a8a',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noAlunos: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alunoNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  alunoEmail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
