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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList, Treino, Exercicio} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';
import {db} from '../data/database';

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

  const atualizarCampo = (
    grupo: string,
    nome: string,
    campo: keyof Exercicio,
    valor: number,
  ) => {
    setExerciciosSelecionados(prev =>
      prev.map(e =>
        e.grupo === grupo && e.exercicio.nome === nome
          ? {...e, exercicio: {...e.exercicio, [campo]: valor}}
          : e,
      ),
    );
  };

  const isSelecionado = (grupo: string, nome: string) =>
    exerciciosSelecionados.some(
      e => e.grupo === grupo && e.exercicio.nome === nome,
    );

  const handleSalvarTreino = () => {
    if (!aluno || !treinoNome || exerciciosSelecionados.length === 0) {
      Alert.alert('Erro', 'Informe o nome e ao menos um exercício.');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO treinos (aluno_email, nomeTreino, data, calorias) VALUES (?, ?, ?, ?)',
        [aluno.email, treinoNome, new Date().toISOString().split('T')[0], 0],
        (_, result) => {
          const treinoId = result.insertId;

          exerciciosSelecionados.forEach(e => {
            tx.executeSql(
              'SELECT id FROM grupos_musculares WHERE nome = ?',
              [e.grupo],
              (_, res) => {
                const grupoId = res.rows.item(0).id;

                tx.executeSql(
                  `INSERT INTO exercicios 
                  (treino_id, grupo_muscular_id, nome, series, repeticoes, pausa) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
                  [
                    treinoId,
                    grupoId,
                    e.exercicio.nome,
                    e.exercicio.series,
                    e.exercicio.repeticoes,
                    e.exercicio.pausa,
                  ],
                );
              },
            );
          });

          Alert.alert('Sucesso', 'Treino salvo com sucesso!');
          navigation.goBack();
        },
        (_, error) => {
          console.error('Erro ao salvar treino:', error);
          Alert.alert('Erro', 'Erro ao salvar treino');
          return false;
        },
      );
    });
  };

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
          {exercicios.map(ex => {
            const selecionado = isSelecionado(grupo, ex);
            const dados = exerciciosSelecionados.find(
              e => e.grupo === grupo && e.exercicio.nome === ex,
            )?.exercicio;

            return (
              <View key={ex} style={styles.exercicioItemContainer}>
                <TouchableOpacity
                  style={[
                    styles.exercicioItem,
                    selecionado && styles.selecionado,
                  ]}
                  onPress={() => toggleExercicio(grupo, ex)}>
                  <Text style={styles.exercicioTexto}>
                    {selecionado ? '✓ ' : '+ '}
                    {ex}
                  </Text>
                </TouchableOpacity>

                {selecionado && dados && (
                  <View style={styles.parametrosContainer}>
                    <TextInput
                      style={styles.parametroInput}
                      keyboardType="numeric"
                      placeholder="Séries"
                      value={String(dados.series)}
                      onChangeText={text =>
                        atualizarCampo(grupo, ex, 'series', Number(text))
                      }
                    />
                    <TextInput
                      style={styles.parametroInput}
                      keyboardType="numeric"
                      placeholder="Repetições"
                      value={String(dados.repeticoes)}
                      onChangeText={text =>
                        atualizarCampo(grupo, ex, 'repeticoes', Number(text))
                      }
                    />
                    <TextInput
                      style={styles.parametroInput}
                      keyboardType="numeric"
                      placeholder="Pausa (s)"
                      value={String(dados.pausa)}
                      onChangeText={text =>
                        atualizarCampo(grupo, ex, 'pausa', Number(text))
                      }
                    />
                  </View>
                )}
              </View>
            );
          })}
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
  exercicioItemContainer: {
    marginBottom: 10,
  },
  exercicioItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  selecionado: {
    backgroundColor: '#cce5ff',
  },
  exercicioTexto: {
    fontSize: 15,
    color: '#007bff',
  },
  parametrosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  parametroInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
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
});
