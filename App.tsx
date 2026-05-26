import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Interfaces for structured data
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface UserCredentials {
  username: string;
  password: string;
}

export default function App() {
  // Auth Screen State: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  
  // Credentials Inputs
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  // Local Registered Users Database (Starts with one default admin)
  const [usersDatabase, setUsersDatabase] = useState<UserCredentials[]>([
    { username: 'admin', password: 'password' }
  ]);

  // To-do States
  const [task, setTask] = useState<string>('');
  const [taskList, setTaskList] = useState<Task[]>([]);

  /* ================= AUTHENTICATION LOGIC ================= */
  
  // 1. Sign Up Handler
  const handleSignUp = (): void => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    
    if (trimmedUser === '' || passwordInput === '') {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    // Check if username already exists
    const userExists = usersDatabase.some(u => u.username === trimmedUser);
    if (userExists) {
      Alert.alert('Error', 'Username is already taken!');
      return;
    }

    // Add new user credentials to our database state
    setUsersDatabase([...usersDatabase, { username: trimmedUser, password: passwordInput }]);
    Alert.alert('Success!', 'Account created successfully! You can now log in.', [
      { text: 'OK', onPress: () => toggleAuthMode('login') }
    ]);
  };

  // 2. Login Handler
  const handleLogin = (): void => {
    const trimmedUser = usernameInput.trim().toLowerCase();

    // Search database for matching credentials
    const validUser = usersDatabase.find(
      u => u.username === trimmedUser && u.password === passwordInput
    );

    if (validUser) {
      setCurrentUser(validUser.username);
      setIsLoggedIn(true);
      // Reset inputs
      setUsernameInput('');
      setPasswordInput('');
    } else {
      Alert.alert('Authentication Failed', 'Invalid username or password.');
    }
  };

  const handleLogout = (): void => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

  const toggleAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setUsernameInput('');
    setPasswordInput('');
  };

  /* ================= TO-DO LOGIC ================= */
  const handleAddTask = (): void => {
    if (task.trim() === '') return;
    setTaskList([...taskList, { id: Date.now().toString(), text: task, completed: false }]);
    setTask('');
  };

  const toggleTask = (id: string): void => {
    setTaskList(taskList.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteTask = (id: string): void => {
    setTaskList(taskList.filter(item => item.id !== id));
  };

  const renderTodoItem: ListRenderItem<Task> = ({ item }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity style={styles.taskTextContainer} onPress={() => toggleTask(item.id)}>
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkboxCheckmark}>✓</Text>}
        </View>
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        
        {!isLoggedIn ? (
          /* ================= AUTHENTICATION OVERLAY ================= */
          <View style={styles.authContainer}>
            <View style={styles.authCard}>
              <Text style={styles.authTitle}>
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.authSubtitle}>
                {authMode === 'login' 
                  ? 'Sign in to manage your daily tasks' 
                  : 'Get started by creating your local profile'}
              </Text>

              <TextInput
                style={styles.authInput}
                placeholder="Username"
                placeholderTextColor="#A4B0BE"
                value={usernameInput}
                onChangeText={setUsernameInput}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.authInput}
                placeholder="Password"
                placeholderTextColor="#A4B0BE"
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry
                autoCapitalize="none"
              />

              {authMode === 'login' ? (
                <>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.switchModeButton} onPress={() => toggleAuthMode('signup')}>
                    <Text style={styles.switchModeText}>
                      Account doesn't exist? <Text style={styles.highlightText}>Sign Up</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#10B981' }]} onPress={handleSignUp}>
                    <Text style={styles.primaryButtonText}>Register</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.switchModeButton} onPress={() => toggleAuthMode('login')}>
                    <Text style={styles.switchModeText}>
                      Already have an account? <Text style={styles.highlightText}>Log In</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          /* ================= MAIN APPLICATION WORKSPACE ================= */
          <View style={styles.mainAppWrapper}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerSubtitle}>Hello, {currentUser}</Text>
                <Text style={styles.headerTitle}>Your Workspace</Text>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              {taskList.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTextTitle}>Clear skies ahead!</Text>
                  <Text style={styles.emptyTextSub}>Catch up on your plans by adding a task below.</Text>
                </View>
              ) : (
                <FlatList
                  data={taskList}
                  renderItem={renderTodoItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputWrapper}
            >
              <TextInput
                style={styles.input}
                placeholder={'Add a brilliant plan...'}
                placeholderTextColor="#A4B0BE"
                value={task}
                onChangeText={setTask}
              />
              <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        )}

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mainAppWrapper: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  authCard: {
    backgroundColor: '#1E293B',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 28,
  },
  authInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  highlightText: {
    color: '#6366F1',
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptyTextSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  taskContainer: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  taskTextContainer: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxCheckmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 15,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
    paddingTop: 12,
    backgroundColor: '#0F172A',
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderColor: '#334155',
    borderWidth: 1,
    flex: 0.82,
    fontSize: 15,
    color: '#F8FAFC',
  },
  addButton: {
    width: 52,
    height: 52,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '400',
  },
});