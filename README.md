# EduBoost - Offline Study Motivator & Tracker

EduBoost is a React Native mobile application designed to help students stay motivated and organized in their studies without requiring an internet connection. The app provides features for storing study materials, tracking study progress, and maintaining study streaks.

## Features

- **Study Material Storage**
  - Upload PDFs
  - Offline access to all stored materials
  
- **Study Streak Tracker**
  - Track daily study sessions
  - View study streaks and progress
  - Visual representation of study patterns

- **Goal & Task System**
  - Set and manage study goals
  - Track goal completion
  - Set target dates for goals

- **Daily Motivation**
  - Receive motivational quotes
  - Track progress with visual statistics
  - Celebrate study milestones

## Technical Stack

- React Native with Expo
- SQLite for offline data storage
- TypeScript for type safety
- Expo Router for navigation
- Expo Document Picker for file handling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eduboost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android
   ```

## Project Structure

```
eduboost/
├── app/                    # Main application code
│   ├── database/          # SQLite database setup and operations
│   ├── components/        # Reusable React components
│   ├── screens/           # Screen components
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── assets/                # Static assets
└── docs/                  # Documentation
```

## Database Schema

The app uses SQLite for offline data storage with the following tables:

- **study_materials**: Stores uploaded study materials
- **study_goals**: Manages study goals and their completion status
- **study_streaks**: Tracks daily study sessions and streaks
- **motivational_quotes**: Stores motivational quotes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape EduBoost
- Special thanks to the React Native and Expo communities for their excellent documentation and support
