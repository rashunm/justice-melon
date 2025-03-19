import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Fade in and scale up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ]),

      // Small bounce animation
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Slight rotation animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes, wait a bit then call onFinish
      setTimeout(onFinish, 500);
    });
  }, []);

  // Convert rotate value to interpolated string
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            },
          ]}
        >
          {/* This is a placeholder for the watermelon with justice hat image */}
          {/* In a real app, you would replace this with the actual image */}
          <View style={styles.watermelonContainer}>
            {/* Justice hat (judge's wig) */}
            <View style={styles.justiceHat}>
              <View style={styles.hatTop} />
              <View style={styles.hatBase} />
              <View style={styles.hatCurl1} />
              <View style={styles.hatCurl2} />
              <View style={styles.hatCurl3} />
            </View>

            {/* Watermelon */}
            <View style={styles.watermelon}>
              <View style={styles.watermelonInner} />
              <View style={styles.seed1} />
              <View style={styles.seed2} />
              <View style={styles.seed3} />
              <View style={styles.seed4} />
              <View style={styles.seed5} />
            </View>
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          JUSTICE MELON
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Serving justice with refreshing intensity
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  watermelonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
  },
  watermelon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  watermelonInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.secondaryLight,
  },
  seed1: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    transform: [{ rotate: '30deg' }],
    top: '35%',
    left: '35%',
  },
  seed2: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    transform: [{ rotate: '-20deg' }],
    top: '55%',
    left: '60%',
  },
  seed3: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    transform: [{ rotate: '45deg' }],
    top: '65%',
    left: '40%',
  },
  seed4: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    transform: [{ rotate: '-40deg' }],
    top: '35%',
    right: '30%',
  },
  seed5: {
    position: 'absolute',
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    transform: [{ rotate: '10deg' }],
    top: '25%',
    left: '50%',
  },
  justiceHat: {
    position: 'absolute',
    top: -45,
    zIndex: 10,
  },
  hatBase: {
    width: 100,
    height: 30,
    backgroundColor: '#eee',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    top: 0,
  },
  hatTop: {
    width: 80,
    height: 25,
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    position: 'absolute',
    top: -15,
    left: 10,
  },
  hatCurl1: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
    right: 15,
    top: -5,
  },
  hatCurl2: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
    left: 15,
    top: -8,
  },
  hatCurl3: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
    left: 35,
    top: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textInverted,
    textAlign: 'center',
    marginHorizontal: 40,
    opacity: 0.8,
  },
});

export default SplashScreen;
