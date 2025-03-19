# Mr. Justice Melon

<p align="center">
  <img src="./assets/icon.png" alt="Mr. Justice Melon Logo" width="120" />
</p>

<p align="center">
  <i>
    Like seeds scattered by the wind,<br>
    Our digital justice blooms across the web,<br>
    A crimson tide of righteousness,<br>
    Washing over those who threaten peace.
  </i>
</p>

## About

Mr. Justice Melon is a mobile application designed for serving distributed justice to websites. The app allows you to test website responsiveness and performance by sending controlled requests with adjustable intensity levels.

## Features

- **Adjustable Intensity**: Choose from presets (Seed, Slice, Half, Full, Patch) or create custom settings
- **Background Mode**: Continue serving justice even when the app is in the background
- **Auto-Intensity**: Let the app determine the optimal intensity based on your device capabilities
- **Custom Sites**: Add your own websites to the justice serving list
- **Detailed Statistics**: View performance metrics for your justice serving sessions
- **Device-Specific Optimization**: Automatically adjusts to your device's capabilities

## Installation

Since Mr. Justice Melon is not available on Google Play Store, you can install it directly:

1. Download the APK from our [release page](https://github.com/mrjusticemelon/justice-melon/releases) (link placeholder)
2. Enable installation from unknown sources in your device settings
3. Open the downloaded APK to install
4. Grant necessary permissions when prompted
5. For better performance with background mode, disable battery optimization (Settings > Apps > Mr. Justice Melon > Battery > Don't optimize)

## Quick Start Guide

1. **Launch the app** - You'll see the main screen with a toggle button
2. **Set intensity** - Choose your desired intensity level from the Justice Serving Controls
3. **Press the toggle** - Activate justice serving with a tap
4. **View results** - Monitor performance stats and results in real-time

## App Screens

### Home Screen

The Home Screen features a central toggle for starting/stopping justice serving, intensity level selection, and expandable controls for fine-tuning your justice serving options.

### Settings Screen

The Settings Screen allows you to:

- Configure custom intensity settings (parallel requests and intervals)
- Manage justice sites (view, add, import)
- Clear saved results
- Check device specifications

### Results Screen

The Results Screen displays detailed statistics from your justice serving sessions, including response times, success rates, and individual website performance.

## For Developers

### Development Setup

#### Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- React Native development environment
- Expo CLI (`npm install -g expo-cli`)
- Android Studio for Android development

#### Installation

1. Clone the repository: `git clone https://github.com/mrjusticemelon/justice-melon.git`
2. Install dependencies: `yarn install` or `npm install`
3. Start the development server: `expo start` or `yarn start` or `npm start`
4. Run on Android: `yarn android` or connect a device via USB and select it in the Expo Go app

### Project Structure

```
justice-melon/
├── assets/             # Images, fonts, and other static assets
│   ├── components/     # Reusable UI components
│   ├── constants/      # Application constants
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── services/       # Services for background processes
│   ├── theme/          # Theme configuration
│   └── utils/          # Utility functions
├── App.tsx             # Root component
└── app.json            # Expo configuration
```

### Contributing

We welcome contributions from the community! Here's how you can help:

1. **Find an issue**: Look for open issues or create a new one
2. **Fork and clone**: Fork the repository and clone it locally
3. **Create a branch**: Make your changes in a new branch
4. **Follow guidelines**: Adhere to our coding standards and testing requirements
5. **Submit a PR**: Create a pull request with a clear description of your changes

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

### Coding Standards

- Use TypeScript for all new code
- Use functional components with hooks
- Follow existing code style and formatting
- Include proper type definitions
- Add tests for new functionality

## Troubleshooting

### App Performance Issues

- Reduce intensity level
- Close other apps running in the background
- Ensure your device has sufficient free memory

### Background Mode Not Working (Android)

- Check battery optimization settings
- Ensure background permissions are granted

### Websites Not Responding

- Check your internet connection
- The target website may be temporarily down

## Privacy and Legal

Mr. Justice Melon respects your privacy:

- No personal data is collected or shared
- All operations occur within the confines of your device
- Use responsibly and within the terms of service of target websites

## Support

If you encounter issues or have questions:

- Check our [FAQ](https://mrjusticemelon.com/faq) (link placeholder)
- Report bugs through the app settings or by creating an issue on GitHub
- Contact support at support@mrjusticemelon.com

## License

Mr. Justice Melon is released under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Thank you for choosing Mr. Justice Melon for your justice serving needs!
</p>
