import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList, Treino, Exercicio} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';

type MontarTreinoRouteProp = RouteProp<RootStackParamList, 'MontarTreino'>;

const GRUPOS_MUSCULARES: {[grupo: string]: string[]} = {
  Peito: ['Supino reto', 'Supino inclinado', 'Peck deck'],
  Costas: ['Puxada frente', 'Remada curvada', 'Deadlift'],
  Pernas: ['Agachamento', 'Leg press', 'Cadeira extensora'],
  Bíceps: ['Rosca direta', 'Rosca martelo'],
  Tríceps: ['Tríceps pulley', 'Tríceps francês'],
  Ombros: ['Desenvolvimento militar', 'Elevação lateral'],
  Abdômen: ['Abdominal crunch', 'Prancha'],
};

const TelaMontarTreino = () => {
  const route = useRoute<MontarTreinoRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {aluno} = route.params;

  const [treinoNome, setTreinoNome] = useState('');
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<
    {grupo: string; exercicio: Exercicio}[]
  >([]);

  const toggleExercicio = (grupo: string, nome: string) => {
    const existe = exerciciosSelecionados.find(
      e => e.grupo === grupo && e.exercicio.nome === nome,
    );

    if (existe) {
      setExerciciosSelecionados(prev =>
        prev.filter(e => !(e.grupo === grupo && e.exercicio.nome === nome)),
      );
    } else {
      setExerciciosSelecionados(prev => [
        ...prev,
        {
          grupo,
          exercicio: {
            nome,
            series: 3,
            repeticoes: 12,
            pausa: 60,
          },
        },
      ]);
    }
  };

  const isSelecionado = (grupo: string, nome: string) =>
    exerciciosSelecionados.some(
      e => e.grupo === grupo && e.exercicio.nome === nome,
    );

  const handleSalvarTreino = async () => {
    if (!aluno || !treinoNome || exerciciosSelecionados.length === 0) {
      Alert.alert(
        'Erro',
        'Informe o nome do treino e selecione ao menos um exercício.',
      );
      return;
    }

    const novoTreino: Treino = {
      nomeTreino: treinoNome,
      data: new Date().toISOString().split('T')[0],
      calorias: 0,
      exercicios: exerciciosSelecionados.map(e => e.exercicio),
    };

    try {
      const key = `treinos_${aluno.email}`;
      const dados = await AsyncStorage.getItem(key);
      const treinos = dados ? JSON.parse(dados) : [];
      treinos.push(novoTreino);
      await AsyncStorage.setItem(key, JSON.stringify(treinos));

      Alert.alert('Sucesso', 'Treino salvo com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
    }
  };

  if (!aluno) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aluno não encontrado</Text>
        <TouchableOpacity
          style={styles.voltarButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{name: 'TelaProfessor'}],
            })
          }>
          <Text style={styles.voltarText}>Voltar para Lista de Alunos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Montar Treino para {aluno.nome}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Treino"
        value={treinoNome}
        onChangeText={setTreinoNome}
      />

      {Object.entries(GRUPOS_MUSCULARES).map(([grupo, exercicios]) => (
        <View key={grupo}>
          <Text style={styles.grupoTitulo}>{grupo}</Text>
          {exercicios.map(ex => (
            <TouchableOpacity
              key={ex}
              style={[
                styles.exercicioItem,
                isSelecionado(grupo, ex) && styles.selecionado,
              ]}
              onPress={() => toggleExercicio(grupo, ex)}>
              <Text
                style={[
                  styles.exercicioTexto,
                  isSelecionado(grupo, ex) && styles.exercicioSelecionadoTexto,
                ]}>
                {isSelecionado(grupo, ex) ? '✓ ' : '+ '}
                {ex}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvarTreino}>
        <Text style={styles.botaoTexto}>Salvar Treino</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TelaMontarTreino;

const styles = StyleSheet.create({
  container: {padding: 20, backgroundColor: '#fff'},
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  exercicioItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 6,
    borderRadius: 6,
  },
  selecionado: {
    backgroundColor: '#cce5ff',
  },
  exercicioTexto: {
    fontSize: 15,
    color: '#007bff',
  },
  exercicioSelecionadoTexto: {
    fontWeight: 'bold',
    color: '#004085',
  },
  botaoSalvar: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 6,
    marginTop: 24,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voltarButton: {
    marginTop: 20,
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  voltarText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
