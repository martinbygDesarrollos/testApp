// React Native AppState – Active | Background | Inactive
// https://aboutreact.com/react-native-appstate/

// import React in our code
import React, { useState, useEffect } from 'react';

// import all the components we are going to use
import { SafeAreaView, StyleSheet, View, AppState, Text } from 'react-native';

const App = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    console.log('App State: ' + nextAppState);
    if (appState != nextAppState) {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App State: ' + 'App has come to the foreground!');
        alert('App State: ' + 'App has come to the foreground!');
      }
      alert('App State: ' + nextAppState);
      setAppState(nextAppState);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>
          Application Status
          {'\n'}
          Active | Background | Inactive
        </Text>
        <Text style={styles.textStyle}>Current state is: {appState}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textStyle: {
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
  },
});

export default App;
