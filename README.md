
# 🧪 FlowBreak — Break Your Forms Before Users Do

**FlowBreak** is an AI-powered HTML form testing playground that helps developers test form validation, identify potential issues, and understand how to fix them using clear, AI-generated explanations.

Instead of manually checking every form field, FlowBreak helps developers explore browser-native HTML validation and uses **Google Gemini** to explain failed tests and suggest corrected HTML.

## ✨ Features

- **HTML Form Testing:** Paste your HTML form markup and run automated validation tests.
- **Validation Analysis:** View passed and failed test cases in one place.
- **AI-Powered Explanations:** Get developer-friendly explanations of failed tests using the Gemini API.
- **Actionable HTML Fixes:** Receive suggested HTML attributes, corrected code snippets, and a repaired form example.
- **Developer-Friendly Experience:** A simple, interactive playground designed to make debugging form validation easier.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express
- **AI Integration:** Google Gemini API using `@google/genai`
- **Development Tools:** npm, TSX

## 🚀 Getting Started

Follow these steps to run FlowBreak locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (an LTS version is recommended)
- npm (included with Node.js)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository

```bash
git clone https://github.com/gaurijaiswal3001/flowbreak.git
cd flowbreak
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

The legacy peer-dependency option may be necessary because of the project's current dependency compatibility requirements.

### 3. Configure environment variables

Create a `.env` file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual API key.

**Security:** Never commit your real `.env` file or expose your API key in frontend code. Keep `.env` excluded through `.gitignore`. Share only a placeholder in `.env.example`.

### 4. Start the application

```bash
npm run dev
```

Open the local URL in your browser:

**http://localhost:3000**

## 🧭 How to Use FlowBreak

1. Open the FlowBreak playground.
2. Paste your HTML form markup into the editor.
3. Run the form tests.
4. Review the passed and failed test cases.
5. Select **Explain Results** to request an AI-generated explanation.
6. Review the diagnosis, suggested HTML fixes, repaired snippet, and practical validation tips.

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key used by the backend to access Google Gemini |

Keep credentials private. Do not commit API keys, tokens, or other secrets to GitHub.

## 🎯 Project Goal

FlowBreak aims to make HTML form validation easier to test, understand, and debug by combining browser-native validation behavior with AI-assisted explanations.

## 🔮 Future Improvements

- Expand the collection of HTML form validation test cases.
- Improve reporting and test-result visualization.
- Add reusable test scenarios for common form patterns.
- Introduce test export and sharing options.
- Improve error handling and AI response reliability.

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them locally.
4. Commit your changes.
5. Open a pull request.

## 📄 License

No license has been specified yet. Until a license is added to the repository, please do not assume that the code is available for unrestricted reuse.

---

**Built to help developers find the break before users do.** 🚀