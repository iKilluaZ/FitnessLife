import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginCadastroScreen from './src/screens/LoginCadastroScreen';
import VerificarUsuario from './src/screens/VerificarUsuario';
import MontarTreino from './src/screens/MontarTreino';
import TelaAluno from './src/screens/TelaAluno';
import DetalhesTreino from './src/screens/DetalhesTreino';

// Definindo os tipos de navegação
export type RootStackParamList = {
  VerificarUsuario: undefined;
  LoginCadastro: undefined;
  TelaAluno: undefined;
  DetalhesTreino: undefined;
  MontarTreino: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="VerificarUsuario"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e3a8a', // Azul escuro
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        {/* Tela de verificação (rota inicial) */}
        <Stack.Screen
          name="VerificarUsuario"
          component={VerificarUsuario}
          options={{headerShown: false}}
        />

        {/* Autenticação */}
        <Stack.Screen
          name="LoginCadastro"
          component={LoginCadastroScreen}
          options={{
            title: 'Login / Cadastro',
            headerShown: false,
          }}
        />

        {/* Fluxo do Aluno */}
        <Stack.Screen
          name="TelaAluno"
          component={TelaAluno}
          options={{title: 'Meu Treino'}}
        />
        <Stack.Screen
          name="DetalhesTreino"
          component={DetalhesTreino}
          options={{title: 'Detalhes do Treino'}}
        />

        {/* Fluxo do Professor */}
        <Stack.Screen
          name="MontarTreino"
          component={MontarTreino}
          options={{title: 'Montar Treino'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
