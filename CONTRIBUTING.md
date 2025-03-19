# Contributing to Mr. Justice Melon

Thank you for your interest in contributing to Mr. Justice Melon! This document provides guidelines and instructions for contributing to this open source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Contribution Process](#contribution-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Pull Requests](#pull-requests)
- [Community](#community)
- [License](#license)

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We expect all contributors to adhere to this code to ensure a positive and inclusive environment for everyone.

## Getting Started

1. **Fork the repository**: Start by forking the [Mr. Justice Melon repository](https://github.com/mrjusticemelon/justice-melon).
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/justice-melon.git`
3. **Add upstream remote**: `git remote add upstream https://github.com/mrjusticemelon/justice-melon.git`
4. **Create a branch**: `git checkout -b feature/your-feature-name`

## Development Environment

### Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- React Native development environment
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

1. Install dependencies: `yarn install` or `npm install`
2. Start the development server: `expo start` or `yarn start` or `npm start`
3. Follow the instructions in the terminal to run the app on a device or emulator

## Project Structure

```
justice-melon/
├── assets/             # Images, fonts, and other static assets
├── src/
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

## Contribution Process

1. **Find an issue**: Look for open issues or create a new one describing the feature or bug you want to work on.
2. **Discuss**: For significant changes, discuss your approach in the issue before starting work.
3. **Implement**: Write your code following the coding standards below.
4. **Test**: Ensure your changes work as expected and add tests where appropriate.
5. **Submit**: Create a pull request with your changes.

## Coding Standards

We follow standard TypeScript/React Native best practices:

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use functional components with hooks instead of class components
- Use descriptive variable and function names
- Include proper type definitions
- Keep components small and focused on a single responsibility
- Add comments for complex logic

We use ESLint and Prettier for code quality and formatting. Run `yarn lint` to check your code and `yarn format` to format it.

## Testing

All contributions should include appropriate tests:

- For components: Add or update tests using React Testing Library
- For utils and services: Add or update unit tests
- For screens: Add or update integration tests

Run tests with `yarn test` before submitting a pull request.

## Documentation

- Add JSDoc comments to functions and components
- Update the README.md if needed
- Document new features in the USER_MANUAL.md
- For complex features, consider adding diagrams or screenshots

## Issue Reporting

When reporting issues, please use the provided issue templates and include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Device information (OS, version, etc.)
- Any additional context that might be helpful

## Pull Requests

When submitting a pull request:

1. Reference the issue your PR addresses
2. Provide a clear description of the changes
3. Include screenshots or videos for UI changes
4. Make sure all tests pass
5. Keep PRs focused on a single concern
6. Respond to feedback and make requested changes
7. Squash commits before merging

## Community

Join our community channels:

- [Discord](https://discord.gg/mrjusticemelon) (placeholder)
- [Twitter](https://twitter.com/mrjusticemelon) (placeholder)
- [Community Forum](https://forum.mrjusticemelon.com) (placeholder)

## License

By contributing to Mr. Justice Melon, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to Mr. Justice Melon and helping make digital justice bloom across the web!
