import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginCadastroScreen from './src/screens/LoginCadastroScreen';
import VerificarUsuario from './src/screens/VerificarUsuario';
import MontarTreino from './src/screens/MontarTreino';
import TelaAluno from './src/screens/TelaAluno';
import DetalhesTreino from './src/screens/DetalhesTreino';
import TelaProfessor from './src/screens/TelaProfessor';
import TelaVisualizarTreino from './src/screens/TelaVisualizarTreino';
import TreinoDoDia from './src/screens/TreinoDoDia';
import {initDB} from './src/data/database'; // inicializa tabelas
import {RootStackParamList} from './src/types'; // Tipagem correta

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    initDB(); // Cria tabelas se ainda não existem
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="VerificarUsuario"
        screenOptions={{
          headerStyle: {backgroundColor: '#1e3a8a'},
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'bold'},
        }}>
        {/* Verificação inicial */}
        <Stack.Screen
          name="VerificarUsuario"
          component={VerificarUsuario}
          options={{headerShown: false}}
        />

        {/* Autenticação */}
        <Stack.Screen
          name="LoginCadastro"
          component={LoginCadastroScreen}
          options={{headerShown: false}}
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
        <Stack.Screen
          name="TelaProfessor"
          component={TelaProfessor}
          options={{title: 'Tela Inicial'}}
        />
        <Stack.Screen
          name="VisualizarTreinos"
          component={TelaVisualizarTreino}
          options={{title: 'Treinos do Aluno'}}
        />

        <Stack.Screen
          name="TreinoDoDia"
          component={TreinoDoDia}
          options={{title: 'Treino do Dia'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
