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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types';

const LoginCadastroScreen = () => {
  const [isCadastro, setIsCadastro] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false); // Para saber se o usuário é professor
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [cadastroData, setCadastroData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    cref: '', // Novo campo para o CREF
  });
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLogin = async () => {
    try {
      const usuarioLogado = await AsyncStorage.getItem(cadastroData.email);

      if (!usuarioLogado) {
        Alert.alert(
          'Erro',
          'Usuário não encontrado. Verifique o e-mail e senha.',
        );
        return;
      }

      const usuario = JSON.parse(usuarioLogado);

      if (usuario.password !== cadastroData.password) {
        Alert.alert('Erro', 'Senha incorreta');
        return;
      }

      // Verificando se o usuário é professor
      if (usuario.isProfessor) {
        navigation.reset({
          index: 0,
          routes: [{name: 'TelaProfessor'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'TelaAluno'}],
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login');
    }
  };

  const handleCadastro = async () => {
    // Validações básicas
    if (!cadastroData.nome || !cadastroData.email || !cadastroData.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (cadastroData.password !== cadastroData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    // Se for professor, valida o campo CREF
    if (isProfessor && !cadastroData.cref) {
      Alert.alert('Erro', 'Por favor, preencha seu CREF');
      return;
    }

    try {
      // Verifica se o usuário já existe
      const usuarioExistente = await AsyncStorage.getItem(cadastroData.email);
      if (usuarioExistente) {
        Alert.alert('Erro', 'Este e-mail já está cadastrado');
        return;
      }

      // Cria o objeto do usuário
      const novoUsuario = {
        nome: cadastroData.nome,
        email: cadastroData.email,
        password: cadastroData.password,
        isProfessor,
        cref: isProfessor ? cadastroData.cref : '', // Se for professor, adiciona o CREF
      };

      // Salva no AsyncStorage (simulando um banco de dados)
      await AsyncStorage.setItem(
        cadastroData.email,
        JSON.stringify(novoUsuario),
      );

      // Salva como usuário logado
      await AsyncStorage.setItem('usuarioLogado', cadastroData.email);

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

      // Redireciona para a tela apropriada
      if (isProfessor) {
        navigation.reset({
          index: 0,
          routes: [{name: 'TelaProfessor'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'TelaAluno'}],
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao cadastrar');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título */}
        <Text style={styles.title}>
          {isCadastro ? 'Crie sua conta' : 'Bem-vindo de volta!'}
        </Text>
        <Text style={styles.subtitle}>
          {isCadastro
            ? 'Preencha os dados abaixo'
            : 'Faça login para continuar'}
        </Text>

        {/* Campos específicos do cadastro */}
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

        {/* Campos comuns */}
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

        {/* Campo de confirmação de senha (apenas cadastro) */}
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

        {/* Switch para saber se é professor */}
        {isCadastro && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Você é professor?</Text>
            <Switch value={isProfessor} onValueChange={setIsProfessor} />
          </View>
        )}

        {/* Campo de CREF (apenas se for professor) */}
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

        {/* Esqueceu senha (apenas login) */}
        {!isCadastro && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RecuperarSenha')}
            style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        )}

        {/* Botão principal */}
        <TouchableOpacity
          style={styles.button}
          onPress={isCadastro ? handleCadastro : handleLogin}>
          <Text style={styles.buttonText}>
            {isCadastro ? 'Cadastrar' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        {/* Divisor */}
        {!isCadastro && (
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        {/* Botão Google (apenas login) */}
        {!isCadastro && (
          <TouchableOpacity style={styles.googleButton}>
            <Image
              source={require('../assets/images/google-icon.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>Entrar com Google</Text>
          </TouchableOpacity>
        )}

        {/* Alternar entre login e cadastro */}
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#aaa',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 6,
    width: '100%',
    marginBottom: 24,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleText: {
    fontSize: 16,
    color: '#333',
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

export default LoginCadastroScreen;
