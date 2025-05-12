import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';

const TelaProfessor = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const alunosList = [];
        const allKeys = await AsyncStorage.getAllKeys();
        for (let i = 0; i < allKeys.length; i++) {
          const email = allKeys[i];
          const usuarioData = await AsyncStorage.getItem(email);
          let usuario = null;
          try {
            if (usuarioData) {
              usuario = JSON.parse(usuarioData);
            }
          } catch (e) {
            console.warn(`Erro ao fazer parse do item ${email}:`, usuarioData);
          }

          if (usuario && !usuario.isProfessor) {
            alunosList.push(usuario);
          }
        }
        setAlunos(alunosList);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os alunos. Verifique os dados armazenados.',
        );
      }
    };

    fetchAlunos();
  }, []);

  const handleMontarTreino = (alunoEmail: string) => {
    const aluno = alunos.find(a => a.email === alunoEmail);
    if (aluno) {
      navigation.navigate('MontarTreino', {aluno});
    } else {
      Alert.alert('Erro', 'Aluno não encontrado.');
    }
  };

  const deletarAluno = async (email: string) => {
    try {
      await AsyncStorage.removeItem(email);
      await AsyncStorage.removeItem(`treinos_${email}`);
      setAlunos(prev => prev.filter(a => a.email !== email));
      Alert.alert('Sucesso', `Aluno ${email} excluído com sucesso.`);
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      Alert.alert('Erro', 'Não foi possível excluir o aluno.');
    }
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
                  onPress={() => handleMontarTreino(item.email)}>
                  <Text style={styles.buttonText}>Montar Treino</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    navigation.navigate('VisualizarTreinos', {aluno: item})
                  }>
                  <Text style={styles.buttonText}>Ver Treinos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    Alert.alert(
                      'Confirmar exclusão',
                      `Deseja excluir ${item.nome}?`,
                      [
                        {text: 'Cancelar', style: 'cancel'},
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () => deletarAluno(item.email),
                        },
                      ],
                      {cancelable: true},
                    )
                  }>
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
