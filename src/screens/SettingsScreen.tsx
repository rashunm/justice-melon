import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Button,
  List,
  Card,
  Title,
  Divider,
  Text,
  Dialog,
  Portal,
  TextInput,
  Subheading,
  Caption,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import {
  testSites,
  DEFAULT_CUSTOM_REQUESTS,
  DEFAULT_CUSTOM_INTERVAL,
} from '../constants/sites';
import { clearTestResults } from '../services/ForegroundService';
import {
  clearTestResults as clearBackgroundTestResults,
  updateCustomSettings as updateBackgroundCustomSettings,
} from '../services/BackgroundService';
import { updateCustomSettings as updateForegroundCustomSettings } from '../services/ForegroundService';
import {
  saveCustomRequestsCount,
  saveCustomInterval,
  getCustomRequestsCount,
  getCustomInterval,
} from '../utils/storage';
import { colors } from '../theme/colors';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const theme = useTheme();

  // State for adding a custom site
  const [customSiteDialogVisible, setCustomSiteDialogVisible] = useState(false);
  const [customSiteUrl, setCustomSiteUrl] = useState('');

  // State for custom intensity settings
  const [customRequestsCount, setCustomRequestsCount] = useState<string>(
    DEFAULT_CUSTOM_REQUESTS.toString()
  );
  const [customInterval, setCustomInterval] = useState<string>(
    DEFAULT_CUSTOM_INTERVAL.toString()
  );
  const [intensityDialogVisible, setIntensityDialogVisible] = useState(false);

  // Load the saved custom intensity settings when the component mounts
  useEffect(() => {
    const loadSettings = async () => {
      const savedRequests = await getCustomRequestsCount();
      const savedInterval = await getCustomInterval();

      setCustomRequestsCount(savedRequests.toString());
      setCustomInterval(savedInterval.toString());
    };

    loadSettings();
  }, []);

  // Handle clearing test results
  const handleClearResults = () => {
    Alert.alert(
      'Clear Results',
      'Are you sure you want to clear all test results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearTestResults();
            clearBackgroundTestResults();
            Alert.alert('Success', 'All test results have been cleared');
          },
        },
      ]
    );
  };

  // Save custom intensity settings
  const saveCustomIntensity = async () => {
    // Validate input
    const requestsCountNum = parseInt(customRequestsCount, 10);
    const intervalNum = parseInt(customInterval, 10);

    if (isNaN(requestsCountNum) || requestsCountNum <= 0) {
      Alert.alert(
        'Invalid Input',
        'Parallel requests must be a positive number'
      );
      return;
    }

    if (isNaN(intervalNum) || intervalNum < 500) {
      Alert.alert('Invalid Input', 'Interval must be at least 500ms');
      return;
    }

    // Show warning for high values
    if (requestsCountNum > 20) {
      Alert.alert(
        'High Request Count',
        'Setting parallel requests higher than 20 may cause device performance issues and battery drain. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: async () => {
              await applyCustomSettings(requestsCountNum, intervalNum);
              setIntensityDialogVisible(false);
            },
          },
        ]
      );
      return;
    }

    // Apply settings
    await applyCustomSettings(requestsCountNum, intervalNum);
    setIntensityDialogVisible(false);
  };

  // Apply custom settings to both services and storage
  const applyCustomSettings = async (
    requestsCount: number,
    interval: number
  ) => {
    try {
      // Save to storage
      await saveCustomRequestsCount(requestsCount);
      await saveCustomInterval(interval);

      // Update service settings
      updateForegroundCustomSettings(requestsCount, interval);
      await updateBackgroundCustomSettings(requestsCount, interval);

      Alert.alert('Success', 'Custom intensity settings have been saved');
    } catch (error) {
      console.error('Error saving custom intensity settings:', error);
      Alert.alert('Error', 'Failed to save custom intensity settings');
    }
  };

  // Add a custom site to test (this is a placeholder function since we would need state management)
  const handleAddCustomSite = () => {
    if (!customSiteUrl) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    // Validate URL format
    try {
      new URL(customSiteUrl);
    } catch (e) {
      Alert.alert(
        'Error',
        'Invalid URL format. Please include http:// or https://'
      );
      return;
    }

    // In a real app, you would add this to the testSites list
    // For now, just show an alert
    Alert.alert(
      'Custom Site Added',
      `URL: ${customSiteUrl}\n\nNote: In this demo version, custom sites are not actually saved.`
    );

    // Close the dialog and clear the input
    setCustomSiteDialogVisible(false);
    setCustomSiteUrl('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>App Settings</Title>

          <List.Section>
            <List.Subheader style={{ color: colors.primary }}>
              Load Test Settings
            </List.Subheader>
            <List.Item
              title='Custom Intensity Configuration'
              description='Set custom parallel requests and interval timing'
              left={(props) => (
                <List.Icon {...props} icon='tune' color={colors.primary} />
              )}
              onPress={() => setIntensityDialogVisible(true)}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textLight }}
            />
          </List.Section>

          <Divider style={{ backgroundColor: colors.divider }} />

          <List.Section>
            <List.Subheader style={{ color: colors.primary }}>
              Test Sites
            </List.Subheader>
            <List.Item
              title='View Test Sites'
              description='See the list of sites being tested'
              left={(props) => (
                <List.Icon {...props} icon='web' color={colors.secondary} />
              )}
              onPress={() => {}}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textLight }}
            />
            <List.Item
              title='Add Custom Site'
              description='Add a custom website to the test list'
              left={(props) => (
                <List.Icon {...props} icon='plus' color={colors.secondary} />
              )}
              onPress={() => setCustomSiteDialogVisible(true)}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textLight }}
            />
          </List.Section>

          <Divider style={{ backgroundColor: colors.divider }} />

          <List.Section>
            <List.Subheader style={{ color: colors.primary }}>
              Data Management
            </List.Subheader>
            <List.Item
              title='Clear Test Results'
              description='Delete all saved test results'
              left={(props) => (
                <List.Icon {...props} icon='delete' color={colors.error} />
              )}
              onPress={handleClearResults}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textLight }}
            />
          </List.Section>

          {Platform.OS === 'android' && (
            <>
              <Divider style={{ backgroundColor: colors.divider }} />
              <List.Section>
                <List.Subheader style={{ color: colors.primary }}>
                  Background Process Settings
                </List.Subheader>
                <List.Item
                  title='Battery Optimization'
                  description='How to disable battery optimization for background testing'
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon='battery'
                      color={colors.secondary}
                    />
                  )}
                  onPress={() => {
                    Alert.alert(
                      'Battery Optimization',
                      "For best results with background testing, disable battery optimization for this app in your device settings:\n\nSettings > Apps > Load Testing > Battery > Don't optimize"
                    );
                  }}
                  titleStyle={{ color: colors.text }}
                  descriptionStyle={{ color: colors.textLight }}
                />
              </List.Section>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>Current Test Sites</Title>
          {testSites.map((site, index) => (
            <Text key={index} style={styles.siteUrl}>
              {site}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>
            Custom Intensity Settings
          </Title>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Parallel Requests:</Text>
            <Text style={styles.settingValue}>{customRequestsCount}</Text>
          </View>
          <Caption>Number of simultaneous requests sent to servers</Caption>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Interval (ms):</Text>
            <Text style={styles.settingValue}>{customInterval}</Text>
          </View>
          <Caption>Time between batches of requests in milliseconds</Caption>

          <Text style={styles.infoText}>
            Warning: High request counts (20+) may cause device performance
            issues and battery drain
          </Text>

          <Button
            mode='outlined'
            onPress={() => setIntensityDialogVisible(true)}
            style={[styles.customizeButton, { borderColor: colors.primary }]}
            color={colors.primary}
          >
            Customize
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>About</Title>
          <Text style={styles.aboutText}>
            Load Testing App v1.0{'\n'}A mobile app for testing website response
            times and performance.
          </Text>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={customSiteDialogVisible}
          onDismiss={() => setCustomSiteDialogVisible(false)}
        >
          <Dialog.Title style={{ color: colors.primary }}>
            Add Custom Site
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label='Website URL'
              value={customSiteUrl}
              onChangeText={setCustomSiteUrl}
              placeholder='https://example.com'
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='url'
              theme={{ colors: { primary: colors.primary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setCustomSiteDialogVisible(false)}
              color={colors.textLight}
            >
              Cancel
            </Button>
            <Button onPress={handleAddCustomSite} color={colors.primary}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={intensityDialogVisible}
          onDismiss={() => setIntensityDialogVisible(false)}
        >
          <Dialog.Title style={{ color: colors.primary }}>
            Custom Intensity Settings
          </Dialog.Title>
          <Dialog.Content>
            <Subheading style={{ color: colors.primary }}>
              Parallel Requests
            </Subheading>
            <TextInput
              label='Number of parallel requests'
              value={customRequestsCount}
              onChangeText={setCustomRequestsCount}
              keyboardType='numeric'
              style={styles.input}
              theme={{ colors: { primary: colors.primary } }}
            />
            <Caption>Recommended: 2-20 requests</Caption>

            <Subheading style={{ marginTop: 16, color: colors.primary }}>
              Test Interval
            </Subheading>
            <TextInput
              label='Interval between tests (ms)'
              value={customInterval}
              onChangeText={setCustomInterval}
              keyboardType='numeric'
              style={styles.input}
              theme={{ colors: { primary: colors.secondary } }}
            />
            <Caption>Minimum: 500ms</Caption>

            <Text style={styles.warningText}>
              Higher request counts will increase load on your device and the
              target servers. Use with caution to avoid potential service
              disruptions or device performance issues.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setIntensityDialogVisible(false)}
              color={colors.textLight}
            >
              Cancel
            </Button>
            <Button onPress={saveCustomIntensity} color={colors.primary}>
              Save
            </Button>
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
  siteUrl: {
    marginVertical: 4,
    color: colors.secondary,
  },
  aboutText: {
    lineHeight: 24,
    color: colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  settingLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.primary,
  },
  settingValue: {
    fontSize: 16,
    color: colors.primary,
  },
  infoText: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
  customizeButton: {
    marginTop: 16,
    borderColor: colors.primary,
  },
  input: {
    marginBottom: 8,
  },
  warningText: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});

export default SettingsScreen;
