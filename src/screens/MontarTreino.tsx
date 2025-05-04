import React, {useState} from 'react';
import {View, TextInput, Text, Button, Alert} from 'react-native';

const MontarTreino = () => {
  const [exercicio, setExercicio] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [series, setSeries] = useState('');

  const handleAdicionarExercicio = () => {
    if (!exercicio || !repeticoes || !series) {
      Alert.alert(
        'Erro',
        'Preencha todos os campos para adicionar o exercício!',
      );
      return;
    }

    // Lógica para adicionar exercício ao treino (salvar em banco ou estado)
    Alert.alert('Sucesso', 'Exercício adicionado ao treino!');
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', padding: 16}}>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 12,
          paddingLeft: 8,
        }}
        placeholder="Nome do Exercício"
        value={exercicio}
        onChangeText={setExercicio}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 12,
          paddingLeft: 8,
        }}
        placeholder="Repetições"
        value={repeticoes}
        onChangeText={setRepeticoes}
        keyboardType="numeric"
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 12,
          paddingLeft: 8,
        }}
        placeholder="Séries"
        value={series}
        onChangeText={setSeries}
        keyboardType="numeric"
      />
      <Button title="Adicionar Exercício" onPress={handleAdicionarExercicio} />
    </View>
  );
};

export default MontarTreino;
