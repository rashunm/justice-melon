import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import {
  Button,
  Switch,
  Text,
  List,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { LoadIntensity } from '../constants/sites';
import {
  startForegroundLoadTest,
  stopForegroundLoadTest,
  isForegroundLoadTestRunning,
  getTestResults,
  addResultCallback,
  removeResultCallback,
} from '../services/ForegroundService';
import {
  startBackgroundLoadTest,
  stopBackgroundLoadTest,
  isBackgroundLoadTestRunning,
} from '../services/BackgroundService';
import { TestResult, calculateStats } from '../utils/loadTest';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // State to track if load testing is active
  const [isTestingActive, setIsTestingActive] = useState<boolean>(false);

  // State to track if background mode is enabled
  const [isBackgroundMode, setIsBackgroundMode] = useState<boolean>(false);

  // Current selected intensity
  const [intensity, setIntensity] = useState<LoadIntensity>(
    LoadIntensity.MEDIUM
  );

  // Recent test results
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);

  // Stats from recent results
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Set up the result callback
    const handleNewResults = (results: TestResult[]) => {
      setRecentResults(results.slice(-5)); // Only show the 5 most recent
      setStats(calculateStats(results));
    };

    addResultCallback(handleNewResults);

    // Clean up when component unmounts
    return () => {
      removeResultCallback(handleNewResults);
    };
  }, []);

  // Toggle load testing on/off
  const toggleLoadTesting = async () => {
    if (isTestingActive) {
      // Stop load testing
      let success = false;

      if (isBackgroundMode) {
        success = await stopBackgroundLoadTest();
      } else {
        success = stopForegroundLoadTest();
      }

      if (success) {
        setIsTestingActive(false);
      } else {
        Alert.alert('Error', 'Failed to stop load testing');
      }
    } else {
      // Start load testing
      let success = false;

      if (isBackgroundMode) {
        success = await startBackgroundLoadTest(intensity);
        if (!success && Platform.OS !== 'android') {
          Alert.alert(
            'Not Supported',
            'Background mode is only supported on Android. Switching to foreground mode.'
          );
          setIsBackgroundMode(false);
          success = startForegroundLoadTest(intensity);
        }
      } else {
        success = startForegroundLoadTest(intensity);
      }

      if (success) {
        setIsTestingActive(true);
      } else {
        Alert.alert('Error', 'Failed to start load testing');
      }
    }
  };

  // Toggle between background and foreground mode
  const toggleBackgroundMode = () => {
    // Can't change mode while testing is active
    if (isTestingActive) {
      Alert.alert('Warning', 'Please stop load testing before changing modes');
      return;
    }

    setIsBackgroundMode(!isBackgroundMode);
  };

  // Change the testing intensity
  const changeIntensity = (newIntensity: LoadIntensity) => {
    // Can't change intensity while testing is active
    if (isTestingActive) {
      Alert.alert(
        'Warning',
        'Please stop load testing before changing intensity'
      );
      return;
    }

    setIntensity(newIntensity);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Load Testing Controls</Title>

          <View style={styles.switchContainer}>
            <Text>
              Background Mode{' '}
              {Platform.OS !== 'android' ? '(Android Only)' : ''}
            </Text>
            <Switch
              value={isBackgroundMode}
              onValueChange={toggleBackgroundMode}
              disabled={isTestingActive || Platform.OS !== 'android'}
            />
          </View>

          <Text style={styles.sectionTitle}>Testing Intensity:</Text>
          <View style={styles.intensityButtons}>
            <Button
              mode={intensity === LoadIntensity.LOW ? 'contained' : 'outlined'}
              onPress={() => changeIntensity(LoadIntensity.LOW)}
              disabled={isTestingActive}
              style={styles.intensityButton}
            >
              Low
            </Button>
            <Button
              mode={
                intensity === LoadIntensity.MEDIUM ? 'contained' : 'outlined'
              }
              onPress={() => changeIntensity(LoadIntensity.MEDIUM)}
              disabled={isTestingActive}
              style={styles.intensityButton}
            >
              Medium
            </Button>
            <Button
              mode={intensity === LoadIntensity.HIGH ? 'contained' : 'outlined'}
              onPress={() => changeIntensity(LoadIntensity.HIGH)}
              disabled={isTestingActive}
              style={styles.intensityButton}
            >
              High
            </Button>
          </View>

          <Button
            mode='contained'
            onPress={toggleLoadTesting}
            style={[
              styles.toggleButton,
              isTestingActive ? styles.stopButton : styles.startButton,
            ]}
          >
            {isTestingActive ? 'Stop Load Testing' : 'Start Load Testing'}
          </Button>
        </Card.Content>
      </Card>

      {isTestingActive && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusContainer}>
              <ActivityIndicator animating={true} color='#6200ee' />
              <Text style={styles.statusText}>
                Load testing active in{' '}
                {isBackgroundMode ? 'background' : 'foreground'} mode with{' '}
                {intensity} intensity
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {stats && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Current Stats</Title>
            <Paragraph>
              Average Response Time: {stats.averageResponseTime.toFixed(2)} ms
            </Paragraph>
            <Paragraph>Success Rate: {stats.successRate.toFixed(2)}%</Paragraph>
            <Paragraph>Total Requests: {stats.totalRequests}</Paragraph>
            <Paragraph>
              Successful: {stats.successCount} | Failed: {stats.failureCount}
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {recentResults.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Results</Title>
            <List.Section>
              {recentResults.map((result, index) => (
                <List.Item
                  key={index}
                  title={result.url}
                  description={`Status: ${
                    result.statusCode || 'Error'
                  } | Time: ${result.responseTime} ms`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={result.error ? 'close-circle' : 'check-circle'}
                      color={result.error ? '#F44336' : '#4CAF50'}
                    />
                  )}
                />
              ))}
            </List.Section>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('Results')}>
              View All Results
            </Button>
          </Card.Actions>
        </Card>
      )}

      <Button
        icon='cog'
        mode='outlined'
        onPress={() => navigation.navigate('Settings')}
        style={styles.settingsButton}
      >
        Settings
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intensityButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  toggleButton: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 16,
  },
  settingsButton: {
    marginVertical: 8,
  },
});

export default HomeScreen;
