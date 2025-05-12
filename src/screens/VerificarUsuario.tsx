import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<any, 'TelaInicial'>;

const TelaInicial: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const emailLogado = await AsyncStorage.getItem('usuarioLogado');

        if (!emailLogado) {
          navigation.reset({index: 0, routes: [{name: 'LoginCadastro'}]});
          return;
        }

        const dadosUsuario = await AsyncStorage.getItem(emailLogado);
        if (!dadosUsuario) {
          navigation.reset({index: 0, routes: [{name: 'LoginCadastro'}]});
          return;
        }

        const usuario = JSON.parse(dadosUsuario);
        if (usuario.isProfessor) {
          navigation.reset({index: 0, routes: [{name: 'TelaProfesor'}]});
        } else {
          navigation.reset({index: 0, routes: [{name: 'TelaAluno'}]}); // Corrigido para 'TelaAluno'
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
      }
    };

    verificarUsuario();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carregando informações do usuário...</Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default TelaInicial;
