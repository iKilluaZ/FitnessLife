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
import {RootStackParamList, Exercicio} from '../types';
import {StackNavigationProp} from '@react-navigation/stack';
import {db} from '../data/database';

type MontarTreinoRouteProp = RouteProp<RootStackParamList, 'MontarTreino'>;

const GRUPOS_MUSCULARES: {[grupo: string]: string[]} = {
  Peito: [
    'Supino reto',
    'Supino inclinado',
    'Supino declinado',
    'Crucifixo reto',
    'Crucifixo inclinado',
    'Cross over',
    'Flexão tradicional',
    'Flexão diamante',
    'Flexão com inclinação',
    'Pullover com halter',
  ],
  Costas: [
    'Puxada frente',
    'Puxada na nuca',
    'Remada curvada',
    'Remada unilateral',
    'Remada cavalinho',
    'Deadlift convencional',
    'Deadlift sumô',
    'Rack pull',
    'Pull over com cabo',
  ],
  Pernas: [
    'Agachamento livre',
    'Agachamento Smith',
    'Agachamento Hack Machine',
    'Leg press 45°',
    'Leg press horizontal',
    'Cadeira extensora',
    'Cadeira flexora',
    'Mesa flexora',
    'Stiff com barra',
    'Stiff com halteres',
    'Afundo com halteres',
    'Afundo no Smith',
    'Panturrilha em pé',
    'Panturrilha sentado',
    'Panturrilha no leg press',
  ],
  Bíceps: [
    'Rosca direta com barra',
    'Rosca direta com halteres',
    'Rosca direta na barra EZ',
    'Rosca martelo com halteres',
    'Rosca martelo na corda',
    'Rosca scott com barra',
    'Rosca scott com halteres',
    'Rosca concentrada',
  ],
  Tríceps: [
    'Tríceps pulley com corda',
    'Tríceps pulley com barra',
    'Tríceps francês sentado',
    'Tríceps francês deitado',
    'Tríceps testa com barra',
    'Mergulho entre bancos',
    'Mergulho nas paralelas',
  ],
  Ombros: [
    'Desenvolvimento militar com barra',
    'Desenvolvimento militar com halteres',
    'Arnold press',
    'Elevação lateral com halteres',
    'Elevação lateral inclinada',
    'Elevação frontal com halteres',
    'Elevação frontal com anilhas',
    'Encolhimento com barra',
    'Encolhimento com halteres',
  ],
  Abdômen: [
    'Abdominal crunch solo',
    'Abdominal crunch máquina',
    'Elevação de pernas deitado',
    'Elevação de pernas suspenso',
    'Abdominal infra solo',
    'Prancha tradicional',
    'Prancha lateral',
    'Prancha dinâmica',
    'Abdominal oblíquo solo',
    'Torção russa',
    'Abdominal lateral na máquina',
  ],
  Cardio: [
    'Corrida na esteira',
    'Corrida ao ar livre',
    'Bicicleta ergométrica',
    'Spinning',
    'Pular corda - Intervalado',
    'Pular corda - Contínuo',
    'HIIT - Alta intensidade',
    'Circuito funcional',
  ],
  FullBody_Funcional: [
    'Agachamento + Desenvolvimento',
    'Deadlift + Remada',
    'Burpees',
    'Kettlebell swing',
    'Box jump',
    'Barra fixa',
    'Flexões',
    'Mountain climbers',
  ],
};

const TelaMontarTreino = () => {
  const route = useRoute<MontarTreinoRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {aluno, professorEmail} = route.params; // professorEmail incluído

  const [treinoNome, setTreinoNome] = useState('');
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<
    {grupo: string; exercicio: Exercicio}[]
  >([]);
  const [gruposExpandidos, setGruposExpandidos] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleGrupo = (grupo: string) => {
    setGruposExpandidos(prev => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  };

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

    const dataHoje = new Date().toISOString().split('T')[0];

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO treinos (aluno_email, nomeTreino, data, calorias, professor_email) VALUES (?, ?, ?, ?, ?)',
        [aluno.email, treinoNome, dataHoje, 0, professorEmail],
        (_, result) => {
          const treinoId = result.insertId;

          exerciciosSelecionados.forEach(e => {
            tx.executeSql(
              'SELECT id FROM grupos_musculares WHERE nome = ?',
              [e.grupo],
              (_, grupoRes) => {
                if (grupoRes.rows.length > 0) {
                  const grupoId = grupoRes.rows.item(0).id;

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
                }
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
        <View key={grupo} style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleGrupo(grupo)}>
            <Text style={styles.grupoTitulo}>{grupo}</Text>
            <Text style={styles.accordionIcon}>
              {gruposExpandidos[grupo] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {gruposExpandidos[grupo] && (
            <View style={styles.exerciciosContainer}>
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
                            atualizarCampo(
                              grupo,
                              ex,
                              'repeticoes',
                              Number(text),
                            )
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
          )}
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
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  accordionContainer: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    elevation: 2,
    padding: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007BFF',
  },
  accordionIcon: {
    fontSize: 18,
    color: '#007BFF',
  },
  exerciciosContainer: {
    marginTop: 8,
  },
  exercicioItemContainer: {
    marginBottom: 10,
  },
  exercicioItem: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f1f1f1',
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
    borderRadius: 30,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
