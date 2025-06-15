import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';
import {db} from '../data/database';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginCadastroScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [loginData, setLoginData] = useState({email: '', password: ''});
  const [cadastroData, setCadastroData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    cref: '',
  });
  const [isCadastro, setIsCadastro] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);

  const handleLogin = async () => {
    console.log('🔐 Iniciando login...');
    console.log('📩 Email:', loginData.email);
    console.log('🔑 Senha:', loginData.password);

    if (!loginData.email || !loginData.password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      db.transaction((tx: SQLite.Transaction) => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?',
          [loginData.email],
          async (_: SQLite.Transaction, result) => {
            if (result.rows.length === 0) {
              Alert.alert('Erro', 'Usuário não encontrado.');
              return;
            }

            const usuario: User = result.rows.item(0);
            console.log('👤 Usuário encontrado:', usuario);

            if (usuario.password !== loginData.password) {
              Alert.alert('Erro', 'Senha incorreta');
              return;
            }

            // Salva o e-mail do usuário logado no AsyncStorage
            await AsyncStorage.setItem('usuarioLogado', usuario.email);

            if (usuario.isProfessor) {
              console.log('👨‍🏫 Redirecionando para TelaProfessor');
              navigation.reset({index: 0, routes: [{name: 'TelaProfessor'}]});
            } else {
              console.log('👨‍🎓 Redirecionando para TelaAluno');
              navigation.reset({index: 0, routes: [{name: 'TelaAluno'}]});
            }
          },
          (_: SQLite.Transaction, error) => {
            console.error('❌ Erro na busca do usuário:', error);
            Alert.alert('Erro', 'Falha ao buscar usuário');
            return false;
          },
        );
      });
    } catch (error) {
      console.error('❌ Erro geral no login:', error);
      Alert.alert('Erro', 'Erro inesperado ao tentar fazer login');
    }
  };

  const handleCadastro = async () => {
    console.log('📝 Iniciando cadastro...');
    console.log('📨 Dados:', cadastroData);

    if (
      !cadastroData.nome ||
      !cadastroData.email ||
      !cadastroData.password ||
      cadastroData.password !== cadastroData.confirmPassword
    ) {
      Alert.alert('Erro', 'Verifique os dados e confirme a senha corretamente');
      return;
    }

    try {
      db.transaction(tx => {
        // Verifica se o e-mail já existe
        tx.executeSql(
          'SELECT COUNT(*) as total FROM users WHERE email = ?',
          [cadastroData.email],
          (_, result) => {
            const total = result.rows.item(0).total;
            if (total > 0) {
              Alert.alert('Erro', 'Este e-mail já está cadastrado');
              return;
            }

            // Insere novo usuário
            tx.executeSql(
              'INSERT INTO users (nome, email, password, isProfessor, cref) VALUES (?, ?, ?, ?, ?)',
              [
                cadastroData.nome,
                cadastroData.email,
                cadastroData.password,
                isProfessor ? 1 : 0,
                isProfessor ? cadastroData.cref : null,
              ],
              async (_, result) => {
                console.log('✅ Usuário cadastrado:', result.insertId);
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

                // Salva o email localmente para uso posterior
                await AsyncStorage.setItem('usuarioLogado', cadastroData.email);

                navigation.reset({
                  index: 0,
                  routes: [{name: isProfessor ? 'TelaProfessor' : 'TelaAluno'}],
                });
              },
              (_, error) => {
                console.error('❌ Erro ao cadastrar usuário:', error);
                Alert.alert('Erro', 'Erro ao salvar o cadastro');
                return false;
              },
            );
          },
          (_, error) => {
            console.error('❌ Erro ao verificar e-mail existente:', error);
            Alert.alert('Erro', 'Falha ao verificar e-mail existente');
            return false;
          },
        );
      });
    } catch (error) {
      console.error('❌ Erro geral no cadastro:', error);
      Alert.alert('Erro', 'Erro inesperado ao cadastrar');
    }
  };

  interface User {
    nome: string;
    email: string;
    password: string;
    isProfessor: number;
    cref?: string | null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          {isCadastro ? 'Crie sua conta' : 'Bem-vindo de volta!'}
        </Text>
        <Text style={styles.subtitle}>
          {isCadastro
            ? 'Preencha os dados abaixo'
            : 'Faça login para continuar'}
        </Text>

        {isCadastro && (
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#aaa"
            value={cadastroData.nome}
            onChangeText={text =>
              setCadastroData({...cadastroData, nome: text})
            }
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={isCadastro ? cadastroData.email : loginData.email}
          onChangeText={text =>
            isCadastro
              ? setCadastroData({...cadastroData, email: text})
              : setLoginData({...loginData, email: text})
          }
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#aaa"
          value={isCadastro ? cadastroData.password : loginData.password}
          onChangeText={text =>
            isCadastro
              ? setCadastroData({...cadastroData, password: text})
              : setLoginData({...loginData, password: text})
          }
          secureTextEntry
        />

        {isCadastro && (
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="#aaa"
            value={cadastroData.confirmPassword}
            onChangeText={text =>
              setCadastroData({...cadastroData, confirmPassword: text})
            }
            secureTextEntry
          />
        )}

        {isCadastro && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Você é professor?</Text>
            <Switch value={isProfessor} onValueChange={setIsProfessor} />
          </View>
        )}

        {isCadastro && isProfessor && (
          <TextInput
            style={styles.input}
            placeholder="CREF"
            placeholderTextColor="#aaa"
            value={cadastroData.cref}
            onChangeText={text =>
              setCadastroData({...cadastroData, cref: text})
            }
          />
        )}

        {!isCadastro && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecuperarSenha')}
            style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={isCadastro ? handleCadastro : handleLogin}>
          <Text style={styles.buttonText}>
            {isCadastro ? 'Cadastrar' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isCadastro ? 'Já tem uma conta?' : 'Novo por aqui?'}
          </Text>
          <TouchableOpacity onPress={() => setIsCadastro(!isCadastro)}>
            <Text style={styles.toggleLink}>
              {isCadastro ? ' Faça login' : ' Crie uma conta'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginCadastroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
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
  forgotContainer: {
    marginBottom: 24,
  },
  forgotText: {
    color: '#007BFF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    width: '100%',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleLink: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
});
