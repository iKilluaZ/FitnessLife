import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Treino} from '../types';

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

const treinosMock: Treino[] = [
  {
    nomeTreino: 'Treino A - Peito e Tríceps',
    data: new Date().toISOString().split('T')[0],
    calorias: 500,
    exercicios: [
      {nome: 'Supino Reto', series: 3, repeticoes: 12, pausa: 60},
      {nome: 'Tríceps Pulley', series: 3, repeticoes: 15, pausa: 45},
    ],
  },
  {
    nomeTreino: 'Treino B - Costas e Bíceps',
    data: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })(),
    calorias: 450,
    exercicios: [
      {nome: 'Puxada Frontal', series: 3, repeticoes: 12, pausa: 60},
      {nome: 'Rosca Direta', series: 3, repeticoes: 10, pausa: 45},
    ],
  },
];

const TelaAluno = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [semana] = useState(gerarSemana());
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);
  const [treinosRealizados] = useState(12);
  const [caloriasGastas] = useState(3500);

  useEffect(() => {
    const treino = treinosMock.find(t => t.data === dataSelecionada);
    setTreinoHoje(treino || null);
  }, [dataSelecionada]);

  const iniciarTreino = () => {
    if (treinoHoje) {
      navigation.navigate('DetalhesTreino', {treino: treinoHoje});
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Simulando logout. Redirecionando...');
    navigation.replace('LoginCadastro');
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
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TelaAluno;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardNumero: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cardTexto: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutContainer: {
    paddingVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
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
