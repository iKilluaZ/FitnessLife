import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {RootStackParamList, Treino} from '../types';

type MontarTreinoRouteProp = RouteProp<RootStackParamList, 'MontarTreino'>;

const TelaMontarTreino = () => {
  const route = useRoute<MontarTreinoRouteProp>();
  const navigation = useNavigation();
  const aluno = route.params?.aluno; // agora aluno é { nome, email }

  const [treinoData, setTreinoData] = useState({
    nome: '',
    series: '',
    repeticoes: '',
    pausa: '',
  });

  const handleSalvarTreino = async () => {
    if (
      !treinoData.nome ||
      !treinoData.series ||
      !treinoData.repeticoes ||
      !treinoData.pausa
    ) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const treinoKey = `treinos_${aluno.email}`;
      const novoTreino: Treino = {
        nomeTreino: treinoData.nome,
        data: new Date().toISOString().split('T')[0],
        calorias: 0,
        exercicios: [
          {
            nome: treinoData.nome,
            series: parseInt(treinoData.series),
            repeticoes: parseInt(treinoData.repeticoes),
            pausa: parseInt(treinoData.pausa),
          },
        ],
      };

      const treinosAntigos = await AsyncStorage.getItem(treinoKey);
      const listaTreinos = treinosAntigos ? JSON.parse(treinosAntigos) : [];

      listaTreinos.push(novoTreino);
      await AsyncStorage.setItem(treinoKey, JSON.stringify(listaTreinos));

      Alert.alert('Sucesso', 'Treino salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
    }
  };

  // Se o aluno não for encontrado (falha no navigation)
  if (!aluno) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aluno não encontrado</Text>
        <TouchableOpacity
          style={styles.voltarButton}
          onPress={() => navigation.navigate('TelaProfessor' as never)}>
          <Text style={styles.voltarText}>Voltar para Lista de Alunos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Montar Treino para {aluno.nome}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Exercício"
        value={treinoData.nome}
        onChangeText={text => setTreinoData({...treinoData, nome: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Séries"
        keyboardType="numeric"
        value={treinoData.series}
        onChangeText={text => setTreinoData({...treinoData, series: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Repetições"
        keyboardType="numeric"
        value={treinoData.repeticoes}
        onChangeText={text => setTreinoData({...treinoData, repeticoes: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Pausa (segundos)"
        keyboardType="numeric"
        value={treinoData.pausa}
        onChangeText={text => setTreinoData({...treinoData, pausa: text})}
      />

      <TouchableOpacity style={styles.button} onPress={handleSalvarTreino}>
        <Text style={styles.buttonText}>Salvar Treino</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaMontarTreino;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    width: '100%',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  voltarButton: {
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  voltarText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
