<div align="center">

![header](https://capsule-render.vercel.app/api?type=rect&color=0:667eea,100:764ba2&height=250&text=Interactive%20Media%202025&fontSize=70&fontColor=ffffff&animation=fadeIn&desc=UTS%20Semester%202%20-%20Creative%20Coding%20Projects&descSize=24&descAlignY=75&fontAlign=50)

# 🎨 Interactive Media Assignment

**Language / 言語 / 언어**

[![English](https://img.shields.io/badge/English-🇺🇸-blue?style=flat-square&logoColor=white)](../README.en.md) ← Current language
[![日本語](https://img.shields.io/badge/日本語-🇯🇵-red?style=flat-square)](../README.ja.md)
[![한국어](https://img.shields.io/badge/한국어-🇰🇷-green?style=flat-square)](../README.ko.md)

**UTS 2025 Semester 2 - Full-Stack Interactive Media Project Hub**

A comprehensive web application featuring 9 interactive p5.js projects with a modern UI/UX design, serverless backend, and full accessibility compliance.

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone repository
git clone https://github.com/salieri009/InteractiveMedia.git
cd InteractiveMedia

# Install dependencies
npm run setup
```

### Development

```bash
# Start frontend development server
npm run dev:frontend

# Start backend API server (optional)
npm run dev:backend
```

Open `frontend/index.html` in your browser or use Live Server extension in VS Code.

---

## 🎯 Projects

This hub contains **9 interactive p5.js projects**:

| Project | Name | Description |
|:------:|:----:|:-----------:|
| **A1A** | Basic Shapes | Fundamental p5.js shape drawing |
| **A1B** | Animated Shapes | Interactive animation with physics |
| **A1C** | Pattern Generator | Interactive pattern generator with multiple modes |
| **A1D** | Urban Glide | Side-scrolling game with building generation |
| **A1E** | Sound-Painted Night Sky | Audio-reactive visualization |
| **A1G** | Interactive Pixel Sort | Real-time pixel manipulation |
| **A1H** | Corpus Comedian | Text analysis and joke generator |
| **A1I** | The Observant Shopper | Computer vision shopping list |
| **A1J** | Dungeon Tile Painter | Interactive tile-based game |

Each project demonstrates different creative coding concepts and interactive media techniques.

---

## ✨ Key Features

- **🎮 Multi-Project Management**  
  Dynamic project switching with smooth transitions and independent project environments

- **📱 Modern UI/UX**  
  Responsive design with 100% Nielsen's Heuristics compliance

- **♿ Accessibility First**  
  WCAG 2.1 AA compliant, full keyboard navigation, ARIA labels

- **☁️ Serverless Backend**  
  AWS Lambda-ready Express.js API with analytics tracking

- **⌨️ Keyboard Shortcuts**  
  `1-9` switch projects, `H` help, `←` back, `Esc` close

---

## 🛠️ Tech Stack

**Frontend:**
- p5.js - Creative coding framework
- Vanilla JavaScript (ES6+) - Modular architecture
- CSS Grid/Flexbox - Responsive layout

**Backend:**
- Express.js - Serverless API framework
- Node.js 18+ - Runtime environment

**Deployment:**
- Vercel/Netlify - Serverless hosting
- CDN - Global content delivery

---

## 📁 Project Structure

```
InteractiveMedia/
├── frontend/          # p5.js projects and UI
│   ├── js/           # Project files (A1A.js, A1B.js, ...)
│   ├── css/          # Styles
│   └── assets/       # Media resources
├── backend/          # Serverless API
│   ├── api/          # Express.js endpoints
│   └── utils/        # Database utilities
└── docs/             # Documentation
```

---

## ➕ Adding New Projects

1. **Copy template:**
   ```bash
   cp frontend/js/_ProjectTemplate.js frontend/js/A1X.js
   ```

2. **Customize project:**
   - Replace `[PROJECT_ID]` with your project ID (e.g., `a1x`)
   - Replace `[PROJECT_NAME]` with your project name
   - Replace `[PROJECT_DESCRIPTION]` with your description

3. **Add to HTML:**
   ```html
   <script src="js/A1X.js"></script>
   ```

4. **Refresh page** - New project button appears automatically! 🎉

---

## 📚 Documentation

- **[QUICK-START.md](QUICK-START.md)** - Detailed setup guide
- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[docs/](docs/)** - Full documentation including design plans and architecture guides

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

![footer](https://capsule-render.vercel.app/api?type=wave&color=0:667eea,100:764ba2&height=150&section=footer&fontSize=50&fontColor=ffffff&animation=twinkling&text=Built%20with%20❤️%20using%20p5.js&desc=UTS%20Interactive%20Media%202025&descSize=18&fontAlign=50)

</div>
