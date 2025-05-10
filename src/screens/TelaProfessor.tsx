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
          const usuario = usuarioData ? JSON.parse(usuarioData) : null;
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
    // Aqui, você pode redirecionar para uma tela onde o professor monta os treinos
    const aluno = alunos.find(a => a.email === alunoEmail);
    if (aluno) {
      navigation.navigate('MontarTreino', {aluno});
    } else {
      Alert.alert('Erro', 'Aluno não encontrado.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alunos Cadastrados</Text>

      {alunos.length === 0 ? (
        <Text style={styles.noAlunosText}>Nenhum aluno cadastrado.</Text>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={item => item.email}
          renderItem={({item}) => (
            <View style={styles.alunoCard}>
              <Text style={styles.alunoName}>{item.nome}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleMontarTreino(item.email)}>
                <Text style={styles.buttonText}>Montar Treino</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alunoName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TelaProfessor;
