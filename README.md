# Load Testing Mobile App

A React Native Expo app designed for load testing websites from your mobile device.

## Features

- **Load Test Multiple Sites**: Test multiple websites in parallel to measure their response times
- **Adjustable Resource Usage**: Choose between low, medium, and high intensity based on your device capabilities
- **Background Testing on Android**: Continue testing websites even when the app is in the background (Android only)
- **Detailed Results**: View comprehensive test results with filtering and search functionality
- **Clean UI**: Modern, responsive UI built with React Native Paper

## Screenshots

(Screenshots would be added here after building the app)

## Installation

1. Ensure you have Node.js and npm installed
2. Install Expo CLI: `npm install -g expo-cli`
3. Clone this repository
4. Navigate to the project directory
5. Install dependencies: `npm install`
6. Start the app: `npm start`

## Development Setup

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## How to Use

1. **Start Load Testing**:

   - Select the desired intensity (Low, Medium, High)
   - Toggle background mode on Android if needed
   - Tap the "Start Load Testing" button

2. **View Results**:

   - Real-time results appear on the home screen
   - Navigate to the Results screen for detailed statistics and filtering

3. **Customize Settings**:
   - Add custom websites to test in the Settings screen
   - Clear test results as needed

## Note for Background Testing on Android

For optimal background testing on Android:

1. Disable battery optimization for this app
2. Settings > Apps > Load Testing > Battery > Don't optimize

## Technologies Used

- React Native
- Expo
- TypeScript
- React Native Paper
- React Navigation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
