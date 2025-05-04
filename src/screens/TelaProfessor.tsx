import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Aluno} from '../types';

const alunosMock: Aluno[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@gmail.com',
    idade: 25,
    MontarTreino: null,
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    email: 'maria@gmail.com',
    idade: 22,
    MontarTreino: null,
  },
  {
    id: '3',
    nome: 'Carlos Lima',
    email: 'carlos@gmail.com',
    idade: 30,
    MontarTreino: null,
  },
];

const TelaProfessor = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula um carregamento de dados
    setTimeout(() => {
      setAlunos(alunosMock);
      setLoading(false);
    }, 1000); // simula 1 segundo de delay
  }, []);

  const abrirDetalhesAluno = (aluno: Aluno) => {
    navigation.navigate('MontarTreino', {aluno});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Alunos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => abrirDetalhesAluno(item)}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </TouchableOpacity>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 12,
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
});
