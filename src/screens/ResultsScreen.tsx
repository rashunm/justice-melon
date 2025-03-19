import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import {
  Card,
  Title,
  Text,
  DataTable,
  Button,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { getTestResults as getForegroundTestResults } from '../services/ForegroundService';
import { getTestResults as getBackgroundTestResults } from '../services/BackgroundService';
import { TestResult, calculateStats } from '../utils/loadTest';

const ResultsScreen: React.FC = () => {
  // Combined results from foreground and background tests
  const [results, setResults] = useState<TestResult[]>([]);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    success: boolean;
    error: boolean;
  }>({ success: true, error: true });

  // Stats from the filtered results
  const [stats, setStats] = useState<any>(null);

  // Load test results when the screen opens
  useEffect(() => {
    const foregroundResults = getForegroundTestResults();
    const backgroundResults = getBackgroundTestResults();

    // Combine and sort all results by timestamp (newest first)
    const allResults = [...foregroundResults, ...backgroundResults].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    setResults(allResults);
    setFilteredResults(allResults);
    setStats(calculateStats(allResults));
  }, []);

  // Apply filters and search when they change
  useEffect(() => {
    let filtered = [...results];

    // Apply status filters
    if (!activeFilters.success) {
      filtered = filtered.filter((result) => result.error !== null);
    }

    if (!activeFilters.error) {
      filtered = filtered.filter((result) => result.error === null);
    }

    // Apply search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((result) =>
        result.url.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredResults(filtered);
    setStats(calculateStats(filtered));
  }, [activeFilters, searchQuery, results]);

  // Toggle a filter
  const toggleFilter = (filter: 'success' | 'error') => {
    setActiveFilters({
      ...activeFilters,
      [filter]: !activeFilters[filter],
    });
  };

  // Export results (placeholder function)
  const exportResults = () => {
    Alert.alert(
      'Export Results',
      'In a real app, this would export the results to a CSV file or share them.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Justice Results</Title>

          <Searchbar
            placeholder='Search by URL'
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter:</Text>
            <Chip
              selected={activeFilters.success}
              onPress={() => toggleFilter('success')}
              style={styles.filterChip}
              icon='check-circle'
            >
              Success
            </Chip>
            <Chip
              selected={activeFilters.error}
              onPress={() => toggleFilter('error')}
              style={styles.filterChip}
              icon='close-circle'
            >
              Errors
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {stats && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Result Statistics</Title>
            <Text>Total Requests: {stats.totalRequests}</Text>
            <Text>
              Average Response Time: {stats.averageResponseTime.toFixed(2)} ms
            </Text>
            <Text>Success Rate: {stats.successRate.toFixed(2)}%</Text>
            <Text>Successful Requests: {stats.successCount}</Text>
            <Text>Failed Requests: {stats.failureCount}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={exportResults} icon='export'>
              Export Results
            </Button>
          </Card.Actions>
        </Card>
      )}

      <Card style={styles.card}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>URL</DataTable.Title>
            <DataTable.Title numeric>Status</DataTable.Title>
            <DataTable.Title numeric>Time (ms)</DataTable.Title>
          </DataTable.Header>

          {filteredResults.length === 0 ? (
            <DataTable.Row>
              <DataTable.Cell>No results found</DataTable.Cell>
              <DataTable.Cell numeric>-</DataTable.Cell>
              <DataTable.Cell numeric>-</DataTable.Cell>
            </DataTable.Row>
          ) : (
            filteredResults.map((result, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode='middle'
                    style={styles.urlText}
                  >
                    {result.url}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text
                    style={{
                      color: result.error ? '#F44336' : '#4CAF50',
                      fontWeight: 'bold',
                    }}
                  >
                    {result.error ? 'Error' : result.statusCode}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell numeric>{result.responseTime}</DataTable.Cell>
              </DataTable.Row>
            ))
          )}
        </DataTable>
      </Card>
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
  },
  searchbar: {
    marginVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  filterLabel: {
    marginRight: 8,
  },
  filterChip: {
    marginHorizontal: 4,
  },
  urlText: {
    maxWidth: 200,
  },
});

export default ResultsScreen;
