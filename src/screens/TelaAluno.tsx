import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {db} from '../data/database';
import {RootStackParamList, Treino, Exercicio} from '../types';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const gerarSemana = () => {
  const hoje = new Date();
  const dias: {data: string; label: string}[] = [];

  for (let i = -3; i <= 3; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);
    const label = `${diasSemana[data.getDay()]}\n${data.getDate()}`;
    dias.push({data: data.toISOString().split('T')[0], label});
  }

  return dias;
};

const TelaAluno = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [semana] = useState(gerarSemana());
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);
  const [emailUsuario, setEmailUsuario] = useState('');
  const [treinosRealizados, setTreinosRealizados] = useState(0);
  const [caloriasGastas, setCaloriasGastas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarEmailUsuario = async () => {
      const email = await AsyncStorage.getItem('usuarioLogado');
      if (email) {
        setEmailUsuario(email);
      } else {
        Alert.alert('Erro', 'Email do usuário não encontrado');
      }
    };
    carregarEmailUsuario();
  }, []);

  useEffect(() => {
    if (emailUsuario) {
      buscarTreinoDoDia();
    }
  }, [emailUsuario, dataSelecionada]);

  const buscarTreinoDoDia = () => {
    setLoading(true);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM treinos WHERE aluno_email = ? AND data = ?',
        [emailUsuario, dataSelecionada],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            const treinoId = row.id;

            tx.executeSql(
              `SELECT e.*, gm.nome as grupo_muscular
               FROM exercicios e
               JOIN grupos_musculares gm ON e.grupo_muscular_id = gm.id
               WHERE e.treino_id = ?`,
              [treinoId],
              (_, exResult) => {
                const exercicios: Exercicio[] = [];
                for (let i = 0; i < exResult.rows.length; i++) {
                  exercicios.push(exResult.rows.item(i));
                }

                setTreinoHoje({
                  id: row.id,
                  aluno_email: row.aluno_email,
                  nomeTreino: row.nomeTreino,
                  data: row.data,
                  calorias: row.calorias || 0,
                  exercicios,
                });
                setTreinosRealizados(1);
                setCaloriasGastas(row.calorias || 0);
                setLoading(false);
              },
            );
          } else {
            setTreinoHoje(null);
            setLoading(false);
          }
        },
        (_, error) => {
          console.error('Erro ao buscar treino do dia:', error);
          setLoading(false);
          return false;
        },
      );
    });
  };

  const iniciarTreino = () => {
    if (treinoHoje) {
      navigation.navigate('DetalhesTreino', {
        treino: treinoHoje,
        alunoEmail: emailUsuario,
      });
    }
  };

  const visualizarTodosTreinos = () => {
    navigation.navigate('VisualizarTreinos', {
      aluno: {email: emailUsuario, nome: 'Aluno'},
      isProfessor: false,
    });
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
      <FlatList
        data={semana}
        horizontal
        contentContainerStyle={styles.diasContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => setDataSelecionada(item.data)}
            style={[
              styles.diaItem,
              item.data === dataSelecionada && styles.diaItemSelecionado,
            ]}>
            <Text
              style={[
                styles.diaTexto,
                item.data === dataSelecionada && styles.diaTextoSelecionado,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.data}
        showsHorizontalScrollIndicator={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.tituloTreino}>Treino do Dia</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <>
            <Text style={styles.nomeTreino}>
              {treinoHoje ? treinoHoje.nomeTreino : 'Nenhum treino disponível'}
            </Text>

            <View style={styles.cardContainer}>
              <View style={styles.card}>
                <Text style={styles.cardNumero}>{treinosRealizados}</Text>
                <Text style={styles.cardTexto}>Treinos Realizados</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardNumero}>{caloriasGastas}</Text>
                <Text style={styles.cardTexto}>Calorias Gastas</Text>
              </View>
            </View>

            {treinoHoje && (
              <TouchableOpacity style={styles.botao} onPress={iniciarTreino}>
                <Text style={styles.textoBotao}>Começar Treino</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.botao, {backgroundColor: '#28a745'}]}
              onPress={visualizarTodosTreinos}>
              <Text style={styles.textoBotao}>Ver Todos os Treinos</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaAluno;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  diasContainer: {
    marginBottom: 20,
  },
  diaItem: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  diaItemSelecionado: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  diaTexto: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    lineHeight: 14,
  },
  diaTextoSelecionado: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tituloTreino: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#343a40',
  },
  nomeTreino: {
    fontSize: 18,
    color: '#007bff',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  cardTexto: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 30,
  },
});
