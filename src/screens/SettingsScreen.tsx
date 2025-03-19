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
  TouchableRipple,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import {
  testSites,
  IntensityLevel,
  INTENSITY_LEVEL_KEY,
  AUTO_DETECT_INTENSITY_KEY,
  CUSTOM_REQUESTS_COUNT_KEY,
  CUSTOM_INTERVAL_KEY,
  DEFAULT_CUSTOM_REQUESTS,
  DEFAULT_CUSTOM_INTERVAL,
  fetchTestSites,
  CUSTOM_SITES_STORAGE_KEY,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Add state to track expanded sections
  const [sitesExpanded, setSitesExpanded] = useState<boolean>(false);
  const [intensityExpanded, setIntensityExpanded] = useState<boolean>(false);

  // New state for bulk import dialog
  const [bulkImportDialogVisible, setBulkImportDialogVisible] = useState(false);
  const [importedSites, setImportedSites] = useState<string[]>([]);
  const [importPreview, setImportPreview] = useState<string>('');

  // State for storing all sites (default + custom)
  const [allSites, setAllSites] = useState<string[]>([]);
  // State for default test sites (from GitHub or cache)
  const [defaultSites, setDefaultSites] = useState<string[]>([]);

  // Load saved custom sites and custom intensity settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      const savedRequests = await getCustomRequestsCount();
      const savedInterval = await getCustomInterval();
      const savedCustomSites = await getCustomSites();

      // Get sites from GitHub or cache
      const availableSites = await fetchTestSites();
      setDefaultSites(availableSites);

      setCustomRequestsCount(savedRequests.toString());
      setCustomInterval(savedInterval.toString());
      setAllSites([...availableSites, ...savedCustomSites]);
    };

    loadSettings();
  }, []);

  const getCustomSites = async (): Promise<string[]> => {
    try {
      const storedSites = await AsyncStorage.getItem(CUSTOM_SITES_STORAGE_KEY);
      if (storedSites !== null) {
        return JSON.parse(storedSites);
      }
      return [];
    } catch (error) {
      console.error('Error retrieving custom sites:', error);
      return [];
    }
  };

  // Function to save custom sites to storage
  const saveCustomSites = async (sites: string[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        CUSTOM_SITES_STORAGE_KEY,
        JSON.stringify(sites)
      );
    } catch (error) {
      console.error('Error saving custom sites:', error);
      Alert.alert('Error', 'Failed to save custom sites');
    }
  };

  // Function to add a single custom site
  const addCustomSite = async (url: string): Promise<void> => {
    try {
      const customSites = await getCustomSites();

      // Check if URL already exists in default or custom sites
      if ([...defaultSites, ...customSites].includes(url)) {
        Alert.alert('Error', 'This URL already exists in your sites list');
        return;
      }

      // Add the new URL and save
      const updatedCustomSites = [...customSites, url];
      await saveCustomSites(updatedCustomSites);

      // Update the local state
      setAllSites([...defaultSites, ...updatedCustomSites]);
      setCustomSiteUrl('');

      Alert.alert('Success', 'Custom site added successfully');
    } catch (error) {
      console.error('Error adding custom site:', error);
      Alert.alert('Error', 'Failed to add custom site');
    }
  };

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

  // Add a custom site to test
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

    // Add the custom site
    addCustomSite(customSiteUrl).then(() => {
      // Expand the sites section to show the newly added site
      setSitesExpanded(true);

      // Close the dialog and clear the input
      setCustomSiteDialogVisible(false);
      setCustomSiteUrl('');
    });
  };

  // Handle bulk import from text file
  const handleBulkImport = async () => {
    // In a real implementation, we would use a document picker:
    // 1. For React Native: react-native-document-picker
    // 2. For Expo: expo-document-picker and expo-file-system

    // Simulating file content for demonstration purposes
    const simulatedFileContent =
      'https://google.com\n' +
      'https://fb.com\n' +
      'invalid-url\n' +
      'https://twitter.com';

    // Parse URLs (one per line)
    const urls = simulatedFileContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Basic validation of URLs
    const validUrls: string[] = [];
    const invalidUrls: string[] = [];

    urls.forEach((url) => {
      try {
        // Try to parse as URL (will throw if invalid)
        new URL(url);
        validUrls.push(url);
      } catch (e) {
        invalidUrls.push(url);
      }
    });

    // Set state for preview
    setImportedSites(validUrls);

    // Create preview text
    let preview = `Found ${validUrls.length} valid URLs:`;
    if (validUrls.length > 0) {
      preview +=
        '\n' + validUrls.map((url, index) => `${index + 1}. ${url}`).join('\n');
    }

    if (invalidUrls.length > 0) {
      preview += `\n\nFound ${invalidUrls.length} invalid URLs:`;
      preview +=
        '\n' +
        invalidUrls.map((url, index) => `${index + 1}. ${url}`).join('\n');
    }

    setImportPreview(preview);
    setBulkImportDialogVisible(true);
  };

  // Confirm bulk import
  const confirmBulkImport = async () => {
    try {
      // Get existing custom sites
      const existingCustomSites = await getCustomSites();

      // Validate and filter URLs
      const validUrls = importedSites.filter((url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      // Remove duplicates with sites already in the list
      const allExistingSites = [...defaultSites, ...existingCustomSites];
      const newUrls = validUrls.filter(
        (url) => !allExistingSites.includes(url)
      );

      // Update custom sites
      const updatedCustomSites = [...existingCustomSites, ...newUrls];
      await saveCustomSites(updatedCustomSites);

      // Update UI
      setAllSites([...defaultSites, ...updatedCustomSites]);
      setBulkImportDialogVisible(false);
      setImportedSites([]);
      setImportPreview('');

      Alert.alert(
        'Success',
        `Added ${newUrls.length} new sites (${
          validUrls.length - newUrls.length
        } duplicates ignored, ${
          importedSites.length - validUrls.length
        } invalid URLs skipped)`
      );
    } catch (error) {
      console.error('Error with bulk import:', error);
      Alert.alert('Error', 'Failed to import sites');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>App Settings</Title>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Justice is served by randomly rotating between target sites.
              Unresponsive sites will be skipped automatically to maintain
              justice flow.
            </Text>
          </View>

          <List.Section>
            <List.Subheader style={{ color: colors.primary }}>
              Justice Serving Settings
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
              Justice Sites
            </List.Subheader>
            <List.Item
              title='View Justice Sites'
              description='See the list of sites being served justice'
              left={(props) => (
                <List.Icon {...props} icon='web' color={colors.secondary} />
              )}
              onPress={() => setSitesExpanded(true)}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textLight }}
            />
            <List.Item
              title='Add Custom Site'
              description='Add a custom website to the justice serving list'
              left={(props) => (
                <List.Icon {...props} icon='plus' color={colors.secondary} />
              )}
              onPress={() => setCustomSiteDialogVisible(true)}
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textLight }}
            />
            <List.Item
              title='Import Sites from File'
              description='Import multiple sites from a text file (one URL per line)'
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='file-import'
                  color={colors.secondary}
                />
              )}
              onPress={handleBulkImport}
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
              title='Clear Justice Results'
              description='Delete all saved justice serving results'
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
                  description='How to disable battery optimization for background justice serving'
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
                      "For best results with background justice serving, disable battery optimization for this app in your device settings:\n\nSettings > Apps > Justice Serving > Battery > Don't optimize"
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
        <TouchableRipple onPress={() => setSitesExpanded(!sitesExpanded)}>
          <View style={styles.cardHeader}>
            <Title style={{ color: colors.primary }}>
              Current Justice Sites
            </Title>
            <List.Icon
              icon={sitesExpanded ? 'chevron-up' : 'chevron-down'}
              color={colors.secondary}
            />
          </View>
        </TouchableRipple>
        {sitesExpanded && (
          <Card.Content>
            {allSites.map((site, index) => (
              <Text key={index} style={styles.siteUrl}>
                {site}
              </Text>
            ))}
          </Card.Content>
        )}
      </Card>

      <Card style={styles.card}>
        <TouchableRipple
          onPress={() => setIntensityExpanded(!intensityExpanded)}
        >
          <View style={styles.cardHeader}>
            <Title style={{ color: colors.primary }}>
              Custom Intensity Settings
            </Title>
            <List.Icon
              icon={intensityExpanded ? 'chevron-up' : 'chevron-down'}
              color={colors.secondary}
            />
          </View>
        </TouchableRipple>
        {intensityExpanded && (
          <Card.Content>
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

            <Text style={styles.warningText}>
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
        )}
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.primary }}>About</Title>
          <Text style={styles.aboutText}>
            Mr. Justice Melon v1.0{'\n'}
            Like seeds scattered by the wind,{'\n'}
            Our digital justice blooms across the web,{'\n'}A crimson tide of
            righteousness,{'\n'}
            Washing over those who threaten peace.
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

        <Dialog
          visible={bulkImportDialogVisible}
          onDismiss={() => setBulkImportDialogVisible(false)}
        >
          <Dialog.Title style={{ color: colors.primary }}>
            Bulk Import Sites
          </Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.importPreviewContainer}>
              <Text style={styles.importPreviewText}>{importPreview}</Text>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setBulkImportDialogVisible(false)}
              color={colors.textLight}
            >
              Cancel
            </Button>
            <Button
              onPress={confirmBulkImport}
              color={colors.primary}
              disabled={importedSites.length === 0}
            >
              Import
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
  infoContainer: {
    backgroundColor: colors.secondaryLight + '30',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  infoText: {
    color: colors.text,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 0,
    paddingVertical: 8,
  },
  importPreviewContainer: {
    maxHeight: 300,
    marginTop: 8,
  },
  importPreviewText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: colors.text,
  },
});

export default SettingsScreen;
