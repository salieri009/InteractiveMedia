![header](https://capsule-render.vercel.app/api?type=rect&color=0:667eea,100:764ba2&height=200&text=Interactive%20Media%202025&fontSize=60&fontColor=ffffff&animation=fadeIn&desc=UTS%20Semester%202%20-%20Creative%20Coding%20Projects&descSize=20&descAlignY=70)

# 🎨 Interactive Media Assignment

**UTS 2025 Semester 2 - Full-Stack Interactive Media Project Hub**

A comprehensive web application featuring 9 interactive p5.js projects with a modern UI/UX design, serverless backend, and full accessibility compliance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0+
- npm 8.0.0+
- Modern web browser

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
# Start frontend
npm run dev:frontend

# Start backend (optional)
npm run dev:backend
```

Open `frontend/index.html` in your browser or use Live Server.

## 🎯 Projects

| Project | Name | Description |
|--------|------|-------------|
| **A1A** | Basic Shapes | Fundamental p5.js shape drawing |
| **A1B** | Animated Shapes | Interactive animation with physics |
| **A1C** | Pattern Generator | Interactive pattern generator with multiple modes |
| **A1D** | Urban Glide | Side-scrolling game with building generation |
| **A1E** | Sound-Painted Night Sky | Audio-reactive visualization |
| **A1G** | Interactive Pixel Sort | Real-time pixel manipulation |
| **A1H** | Corpus Comedian | Text analysis and joke generator |
| **A1I** | The Observant Shopper | Computer vision shopping list |
| **A1J** | Dungeon Tile Painter | Interactive tile-based game |

## ✨ Key Features

- **Multi-Project Management** - Dynamic project switching with smooth transitions
- **Modern UI/UX** - Responsive design with Nielsen's Heuristics compliance
- **Accessibility First** - WCAG 2.1 AA compliant, keyboard navigation, ARIA labels
- **Serverless Backend** - AWS Lambda-ready Express.js API
- **Keyboard Shortcuts** - `1-9` switch projects, `H` help, `←` back, `Esc` close

## 🛠️ Tech Stack

**Frontend:** p5.js, Vanilla JavaScript (ES6+), CSS Grid/Flexbox  
**Backend:** Express.js, Node.js 18+  
**Deployment:** Vercel/Netlify (Serverless)

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

## ➕ Adding New Projects

1. Copy template: `cp frontend/js/_ProjectTemplate.js frontend/js/A1X.js`
2. Customize project ID, name, and description
3. Add script tag to `frontend/index.html`
4. Project appears automatically!

## 📚 Documentation

- [QUICK-START.md](QUICK-START.md) - Detailed setup guide
- [SETUP.md](SETUP.md) - Complete setup instructions
- [docs/](docs/) - Full documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ using p5.js | UTS Interactive Media 2025**
