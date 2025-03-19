# Building Mr. Justice Melon for Android

This guide will walk you through the process of building an APK for Mr. Justice Melon that you can install on Android devices.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- Java Development Kit (JDK 11)
- Android Studio
- Android SDK (API level 29 or higher)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

## Setup Environment Variables

1. Make sure Android SDK environment variables are properly set:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

2. Verify that your `JAVA_HOME` environment variable is set correctly:

```bash
export JAVA_HOME=/path/to/your/jdk
```

## Method 1: Build with Expo (Recommended)

### Setup EAS Build

1. Install project dependencies:

```bash
cd justice-melon
npm install # or yarn install
```

2. Log in to your Expo account:

```bash
eas login
```

3. Configure the build by creating or updating `eas.json` in the project root:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

4. Build the APK:

```bash
eas build -p android --profile preview
```

5. Once the build is complete, Expo will provide a URL to download the APK.

## Method 2: Build Locally

If you prefer to build the APK locally without Expo's build service:

### 1. Eject to ExpoKit (if using Expo)

```bash
expo eject
```

### 2. Generate Keystore

If you don't have a keystore for signing the app:

```bash
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Configure Gradle

Update `android/app/build.gradle` to include your keystore information:

```gradle
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            storeFile file("my-release-key.keystore")
            storePassword "your-store-password"
            keyAlias "my-key-alias"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

### 4. Build the APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`

## Installing the APK

1. Transfer the APK to your Android device (via USB, email, or cloud storage)
2. On your Android device, go to Settings > Security
3. Enable "Unknown sources" to allow installation of apps from sources other than the Play Store
4. Use a file manager to locate and tap on the APK file to install

## Troubleshooting

### Build Fails with Memory Issues

If you encounter memory issues during the build:

```bash
# In android/gradle.properties, add:
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
```

### Missing Android SDK Components

If you're missing required SDK components:

```bash
sdkmanager "platforms;android-30" "build-tools;30.0.2"
```

### Keystore Issues

If you face issues with the keystore, ensure your keystore passwords are correctly set in the `gradle.properties` file or use the Android Studio signing interface to manage your keystores.

## Distributing Your APK

Once you've built your APK, you can distribute it through:

1. Direct download links from your website
2. Email attachments
3. Cloud storage services (Google Drive, Dropbox)
4. Alternative app stores like F-Droid
5. Using a service like Firebase App Distribution for beta testing

Remember to increment your `versionCode` and `versionName` in `android/app/build.gradle` whenever you build a new version.

---

For more information, refer to the [React Native documentation](https://reactnative.dev/docs/signed-apk-android) on generating signed APKs.
