# Social Work Examination (SWEXAM)

An interactive web-based quiz application for social work group practice education and assessment.

## 🎯 Overview

This application provides comprehensive examination sets covering social work group practice concepts, methodologies, and applications. It features 10 distinct exam sets with 100 multiple-choice questions each, totaling 1000 unique questions derived from professional social work literature.

## ✨ Features

- **10 Comprehensive Exam Sets**: Each containing exactly 100 unique multiple-choice questions
- **Interactive Quiz Interface**: Modern, responsive design with intuitive navigation
- **Progress Tracking**: Automatic saving of progress with browser localStorage
- **Detailed Results**: Comprehensive scoring with explanations for each answer
- **Answer Review**: Preview and review answers before submission
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Offline Capable**: Static deployment requires no server or database

## 📚 Content Coverage

Questions cover key areas of social work group practice:

- Group Development and Formation
- Group Structure and Process
- Group Work Approaches and Models
- Social Work Practice Methods
- Professional Ethics and Standards
- Group Dynamics and Intervention

## 🚀 Live Application

Visit the live application: [https://kirachon.github.io/SWEXAM/](https://kirachon.github.io/SWEXAM/)

## 🛠️ Technical Stack

- **Frontend**: React 18 with Vite
- **Styling**: CSS3 with custom design system
- **Data Storage**: Static JSON files with localStorage for progress
- **Deployment**: GitHub Pages with automated CI/CD
- **Build Tool**: Vite for fast development and optimized production builds

## 📖 Usage

1. **Select an Exam Set**: Choose from 10 available exam sets
2. **Take the Quiz**: Answer multiple-choice questions at your own pace
3. **Review Answers**: Preview your responses before final submission
4. **View Results**: Get detailed scoring and explanations
5. **Track Progress**: Your progress is automatically saved

## 🏗️ Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/Kirachon/SWEXAM.git
cd SWEXAM

# Install dependencies
cd quiz-app
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
SWEXAM/
├── quiz-app/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── styles/          # CSS stylesheets
│   │   ├── utils/           # Utility functions
│   │   └── data/            # Exam sets and questions
│   └── dist/                # Production build
├── scripts/                 # Data processing scripts
├── exam-sets/              # Generated exam data
└── extracted-content/      # Source material
```

## 📊 Question Generation

Questions are generated from professional social work literature using automated content analysis:

1. **Content Extraction**: PDF documents are processed to extract educational content
2. **Question Generation**: Multiple-choice questions are created from concepts and definitions
3. **Quality Assurance**: All questions are validated for accuracy and educational value
4. **Exam Organization**: Questions are distributed across 10 balanced exam sets

## 🔒 Data Privacy

- All data is stored locally in your browser
- No personal information is transmitted to external servers
- Progress and results are saved using browser localStorage
- No tracking or analytics beyond basic GitHub Pages metrics

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Note**: This application is designed for educational purposes and professional development in social work practice. All content is derived from established social work literature and best practices.
