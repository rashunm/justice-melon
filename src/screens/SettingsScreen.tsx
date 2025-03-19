import React, { useState } from 'react';
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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { testSites } from '../constants/sites';
import { clearTestResults } from '../services/ForegroundService';
import { clearTestResults as clearBackgroundTestResults } from '../services/BackgroundService';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  // State for adding a custom site
  const [customSiteDialogVisible, setCustomSiteDialogVisible] = useState(false);
  const [customSiteUrl, setCustomSiteUrl] = useState('');

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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>App Settings</Title>

          <List.Section>
            <List.Subheader>Test Sites</List.Subheader>
            <List.Item
              title='View Test Sites'
              description='See the list of sites being tested'
              left={(props) => <List.Icon {...props} icon='web' />}
              onPress={() => {}}
            />
            <List.Item
              title='Add Custom Site'
              description='Add a custom website to the test list'
              left={(props) => <List.Icon {...props} icon='plus' />}
              onPress={() => setCustomSiteDialogVisible(true)}
            />
          </List.Section>

          <Divider />

          <List.Section>
            <List.Subheader>Data Management</List.Subheader>
            <List.Item
              title='Clear Test Results'
              description='Delete all saved test results'
              left={(props) => (
                <List.Icon {...props} icon='delete' color='#F44336' />
              )}
              onPress={handleClearResults}
            />
          </List.Section>

          {Platform.OS === 'android' && (
            <>
              <Divider />
              <List.Section>
                <List.Subheader>Background Process Settings</List.Subheader>
                <List.Item
                  title='Battery Optimization'
                  description='How to disable battery optimization for background testing'
                  left={(props) => <List.Icon {...props} icon='battery' />}
                  onPress={() => {
                    Alert.alert(
                      'Battery Optimization',
                      "For best results with background testing, disable battery optimization for this app in your device settings:\n\nSettings > Apps > Load Testing > Battery > Don't optimize"
                    );
                  }}
                />
              </List.Section>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Current Test Sites</Title>
          {testSites.map((site, index) => (
            <Text key={index} style={styles.siteUrl}>
              {site}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>About</Title>
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
          <Dialog.Title>Add Custom Site</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label='Website URL'
              value={customSiteUrl}
              onChangeText={setCustomSiteUrl}
              placeholder='https://example.com'
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='url'
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCustomSiteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleAddCustomSite}>Add</Button>
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  siteUrl: {
    marginVertical: 4,
    color: '#333',
  },
  aboutText: {
    lineHeight: 24,
  },
});

export default SettingsScreen;
