import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Button,
  Switch,
  Text,
  List,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Dialog,
  Portal,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { IntensityLevel } from '../constants/sites';
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
import {
  getDeviceSpecs,
  getRecommendedIntensity,
  DeviceSpecs,
} from '../utils/deviceInfo';
import { colors } from '../theme/colors';
import { getIntensityColor } from '../theme/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const theme = useTheme();

  // State to track if load testing is active
  const [isTestingActive, setIsTestingActive] = useState<boolean>(false);

  // State to track if background mode is enabled
  const [isBackgroundMode, setIsBackgroundMode] = useState<boolean>(false);

  // Current selected intensity
  const [intensity, setIntensity] = useState<IntensityLevel>(
    IntensityLevel.MEDIUM
  );

  // State for auto intensity detection
  const [isAutoIntensity, setIsAutoIntensity] = useState<boolean>(false);

  // Recent test results
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);

  // Stats from recent results
  const [stats, setStats] = useState<any>(null);

  // Device specs state
  const [deviceSpecs, setDeviceSpecs] = useState<DeviceSpecs | null>(null);
  const [specsDialogVisible, setSpecsDialogVisible] = useState<boolean>(false);

  // Load device specs and recommended intensity when the component mounts
  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const specs = await getDeviceSpecs();
        setDeviceSpecs(specs);

        // Get recommended intensity if auto intensity is enabled
        if (isAutoIntensity) {
          const recommendedIntensity = await getRecommendedIntensity();
          setIntensity(recommendedIntensity);
        }
      } catch (error) {
        console.error('Error getting device specs:', error);
        // Create fallback device info with platform information we can get from React Native
        setDeviceSpecs({
          manufacturer: null,
          modelName: null,
          deviceYearClass: null,
          totalMemory: null,
          osName: Platform.OS,
          osVersion: Platform.Version.toString(),
          osBuildId: null,
          deviceName: null,
          screenWidth: Dimensions.get('window').width,
          screenHeight: Dimensions.get('window').height,
          isDevice: true,
          platformApiLevel: null,
        });
      }
    };

    getDeviceInfo();
  }, [isAutoIntensity]);

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

  // Toggle auto intensity detection
  const toggleAutoIntensity = async () => {
    // Can't change auto intensity while testing is active
    if (isTestingActive) {
      Alert.alert(
        'Warning',
        'Please stop load testing before changing settings'
      );
      return;
    }

    const newAutoIntensity = !isAutoIntensity;
    setIsAutoIntensity(newAutoIntensity);

    // If enabling auto intensity, determine the recommended setting
    if (newAutoIntensity) {
      const recommendedIntensity = await getRecommendedIntensity();
      setIntensity(recommendedIntensity);
      Alert.alert(
        'Auto Intensity',
        `Based on your device capabilities, ${recommendedIntensity} intensity is recommended.`
      );
    }
  };

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
          success = await startForegroundLoadTest(intensity);
        }
      } else {
        success = await startForegroundLoadTest(intensity);
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
  const changeIntensity = (newIntensity: IntensityLevel) => {
    // Can't change intensity while testing is active
    if (isTestingActive) {
      Alert.alert(
        'Warning',
        'Please stop load testing before changing intensity'
      );
      return;
    }

    // Disable auto intensity when manually changing intensity
    if (isAutoIntensity) {
      setIsAutoIntensity(false);
    }

    setIntensity(newIntensity);
  };

  // Format memory size in a human-readable format
  const formatMemorySize = (bytes: number | null): string => {
    if (bytes === null) return 'Unknown';

    const gigabytes = bytes / (1024 * 1024 * 1024);
    return `${gigabytes.toFixed(2)} GB`;
  };

  // Helper function to get intensity button colors based on the selected intensity
  const getIntensityButtonStyle = (buttonIntensity: IntensityLevel) => {
    if (intensity === buttonIntensity) {
      const intensityColors = getIntensityColor(buttonIntensity);
      return {
        backgroundColor: intensityColors.background,
        borderColor: intensityColors.background,
      };
    }
    return {};
  };

  // Helper function to get intensity button text colors
  const getIntensityTextColor = (buttonIntensity: IntensityLevel) => {
    if (intensity === buttonIntensity) {
      const intensityColors = getIntensityColor(buttonIntensity);
      return { color: intensityColors.text };
    }
    return {};
  };

  // Helper function to get a user-friendly name for intensity levels
  const getIntensityDisplayName = (level: IntensityLevel): string => {
    switch (level) {
      case IntensityLevel.LOW:
        return 'Seed';
      case IntensityLevel.MEDIUM:
        return 'Slice';
      case IntensityLevel.HIGH:
        return 'Half';
      case IntensityLevel.VERY_HIGH:
        return 'Full';
      case IntensityLevel.EXTREME:
        return 'Patch';
      case IntensityLevel.CUSTOM:
        return 'Custom';
      default:
        return 'Unknown';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>
            🍉 Justice Serving Controls
          </Title>

          <View style={styles.switchContainer}>
            <Text>
              Background Mode{' '}
              {Platform.OS !== 'android' ? '(Android Only)' : ''}
            </Text>
            <Switch
              value={isBackgroundMode}
              onValueChange={toggleBackgroundMode}
              disabled={isTestingActive || Platform.OS !== 'android'}
              color={colors.secondary}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text>Auto Intensity (Based on Device Specs)</Text>
            <Switch
              value={isAutoIntensity}
              onValueChange={toggleAutoIntensity}
              disabled={isTestingActive}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🍉 Watermelon Intensity:
          </Text>
          <View style={[styles.intensityButtons, styles.intensityRow]}>
            <Button
              mode={intensity === IntensityLevel.LOW ? 'contained' : 'outlined'}
              onPress={() => changeIntensity(IntensityLevel.LOW)}
              disabled={isTestingActive || isAutoIntensity}
              style={[
                styles.intensityButton,
                getIntensityButtonStyle(IntensityLevel.LOW),
              ]}
              labelStyle={getIntensityTextColor(IntensityLevel.LOW)}
              color={colors.secondaryLight}
            >
              Seed
            </Button>
            <Button
              mode={
                intensity === IntensityLevel.MEDIUM ? 'contained' : 'outlined'
              }
              onPress={() => changeIntensity(IntensityLevel.MEDIUM)}
              disabled={isTestingActive || isAutoIntensity}
              style={[
                styles.intensityButton,
                getIntensityButtonStyle(IntensityLevel.MEDIUM),
              ]}
              labelStyle={getIntensityTextColor(IntensityLevel.MEDIUM)}
              color={colors.secondary}
            >
              Slice
            </Button>
            <Button
              mode={
                intensity === IntensityLevel.HIGH ? 'contained' : 'outlined'
              }
              onPress={() => changeIntensity(IntensityLevel.HIGH)}
              disabled={isTestingActive || isAutoIntensity}
              style={[
                styles.intensityButton,
                getIntensityButtonStyle(IntensityLevel.HIGH),
              ]}
              labelStyle={getIntensityTextColor(IntensityLevel.HIGH)}
              color={colors.primaryLight}
            >
              Half
            </Button>
          </View>
          <View style={[styles.intensityButtons, styles.intensityRow]}>
            <Button
              mode={
                intensity === IntensityLevel.VERY_HIGH
                  ? 'contained'
                  : 'outlined'
              }
              onPress={() => changeIntensity(IntensityLevel.VERY_HIGH)}
              disabled={isTestingActive || isAutoIntensity}
              style={[
                styles.intensityButton,
                getIntensityButtonStyle(IntensityLevel.VERY_HIGH),
              ]}
              labelStyle={getIntensityTextColor(IntensityLevel.VERY_HIGH)}
              color={colors.primary}
            >
              Full
            </Button>
            <Button
              mode={
                intensity === IntensityLevel.EXTREME ? 'contained' : 'outlined'
              }
              onPress={() => changeIntensity(IntensityLevel.EXTREME)}
              disabled={isTestingActive || isAutoIntensity}
              style={[
                styles.intensityButton,
                getIntensityButtonStyle(IntensityLevel.EXTREME),
              ]}
              labelStyle={getIntensityTextColor(IntensityLevel.EXTREME)}
              color={colors.primaryDark}
            >
              Patch
            </Button>
            <Button
              mode={
                intensity === IntensityLevel.CUSTOM ? 'contained' : 'outlined'
              }
              onPress={() => {
                changeIntensity(IntensityLevel.CUSTOM);
                navigation.navigate('Settings');
              }}
              disabled={isTestingActive || isAutoIntensity}
              style={[
                styles.intensityButton,
                getIntensityButtonStyle(IntensityLevel.CUSTOM),
              ]}
              labelStyle={getIntensityTextColor(IntensityLevel.CUSTOM)}
              color={colors.accent}
            >
              Custom
            </Button>
          </View>

          <Button
            mode='contained'
            onPress={toggleLoadTesting}
            style={[
              styles.toggleButton,
              isTestingActive
                ? { backgroundColor: colors.error }
                : { backgroundColor: colors.secondary },
            ]}
          >
            {isTestingActive ? 'Stop Serving Justice' : 'Start Serving Justice'}
          </Button>
        </Card.Content>
      </Card>

      {isTestingActive && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusContainer}>
              <ActivityIndicator animating={true} color={colors.primary} />
              <Text style={styles.statusText}>
                Justice serving active in{' '}
                {isBackgroundMode ? 'background' : 'foreground'} mode with{' '}
                {getIntensityDisplayName(intensity)} intensity
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {stats && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: colors.primary }}>Current Stats</Title>
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

      <Button
        mode='outlined'
        icon='devices'
        onPress={() => setSpecsDialogVisible(true)}
        style={[styles.specsButton, { borderColor: colors.secondary }]}
        color={colors.secondary}
      >
        Device Specifications
      </Button>

      {recentResults.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: colors.primary }}>Recent Results</Title>
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
                      color={result.error ? colors.error : colors.success}
                    />
                  )}
                />
              ))}
            </List.Section>
          </Card.Content>
          <Card.Actions>
            <Button
              onPress={() => navigation.navigate('Results')}
              color={colors.primary}
            >
              View All Results
            </Button>
          </Card.Actions>
        </Card>
      )}

      <Button
        icon='cog'
        mode='outlined'
        onPress={() => navigation.navigate('Settings')}
        style={[styles.settingsButton, { borderColor: colors.primary }]}
        color={colors.primary}
      >
        Settings
      </Button>

      <Portal>
        <Dialog
          visible={specsDialogVisible}
          onDismiss={() => setSpecsDialogVisible(false)}
          style={styles.specsDialog}
        >
          <Dialog.Title style={{ color: colors.primary }}>
            Device Specifications
          </Dialog.Title>
          <Dialog.Content>
            {deviceSpecs ? (
              <>
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    Device:{' '}
                  </Text>
                  {deviceSpecs.manufacturer ||
                    deviceSpecs.modelName ||
                    'Unknown Device'}
                </Paragraph>
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    Device Year Class:{' '}
                  </Text>
                  {deviceSpecs.deviceYearClass || 'Not available'}
                </Paragraph>
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    Memory:{' '}
                  </Text>
                  {formatMemorySize(deviceSpecs.totalMemory)}
                </Paragraph>
                <Divider style={styles.specDivider} />
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    OS:{' '}
                  </Text>
                  {deviceSpecs.osName || 'Unknown OS'}{' '}
                  {deviceSpecs.osVersion || ''}
                </Paragraph>
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    API Level:{' '}
                  </Text>
                  {deviceSpecs.platformApiLevel || 'Not available'}
                </Paragraph>
                <Divider style={styles.specDivider} />
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    Screen:{' '}
                  </Text>
                  {deviceSpecs.screenWidth} × {deviceSpecs.screenHeight}
                </Paragraph>
                <Paragraph style={styles.specItem}>
                  <Text style={[styles.specLabel, { color: colors.primary }]}>
                    Physical Device:{' '}
                  </Text>
                  {deviceSpecs.isDevice ? 'Yes' : 'No (Emulator/Simulator)'}
                </Paragraph>
                <Divider style={styles.specDivider} />
                <Paragraph
                  style={[styles.specItemBold, { color: colors.primary }]}
                >
                  Current Intensity: {intensity.toUpperCase()}
                </Paragraph>
                <Paragraph style={styles.specItem}>
                  {isAutoIntensity
                    ? 'Auto intensity is enabled - the app automatically selected the best intensity based on your device capabilities.'
                    : 'Auto intensity is disabled - you can enable it to automatically select the optimal intensity.'}
                </Paragraph>
              </>
            ) : (
              <Paragraph>Loading device specifications...</Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setSpecsDialogVisible(false)}
              color={colors.primary}
            >
              Close
            </Button>
            {!isAutoIntensity && deviceSpecs && (
              <Button onPress={toggleAutoIntensity} color={colors.secondary}>
                Use Recommended
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderColor: colors.cardOutline,
    borderWidth: 1,
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
    color: colors.text,
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intensityButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  intensityRow: {
    marginBottom: 8,
  },
  toggleButton: {
    marginVertical: 8,
    paddingVertical: 8,
  },
  startButton: {
    backgroundColor: colors.secondary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 16,
    color: colors.text,
  },
  settingsButton: {
    marginVertical: 8,
    borderColor: colors.primary,
  },
  specsButton: {
    marginBottom: 16,
    backgroundColor: colors.secondaryLight + '33', // Adding transparency
    borderColor: colors.secondary,
  },
  specsDialog: {
    maxHeight: '80%',
  },
  specItem: {
    marginVertical: 4,
  },
  specLabel: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  specDivider: {
    marginVertical: 8,
    backgroundColor: colors.divider,
  },
  specItemBold: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
    color: colors.primary,
  },
});

export default HomeScreen;
