# 🎨 Interactive Media Assignment - Complete Project Hub

**UTS 2025 Semester 2 - Full-Stack Interactive Media Application**

A comprehensive full-stack web application featuring p5.js frontend and Node.js Express backend with AWS cloud deployment capabilities.

## 🌟 Key Features

### 🎮 Multi-Project Management
- **Dynamic Project Switching** - Switch between projects with buttons
- **Independent Project Environments** - Each project runs independently
- **Real-time Canvas Updates** - Smooth transitions between projects
- **Project Template System** - Easy creation of new projects

### 🌐 Cloud-Ready Backend
- **Serverless API** - AWS Lambda-based Express.js backend
- **Analytics Tracking** - Track views, likes, and user engagement
- **Offline Support** - Works without internet connection
- **Real-time Synchronization** - Data sync when online

### 📱 Modern UI/UX
- **Responsive Design** - Supports desktop, tablet, and mobile
- **Animated Transitions** - Smooth UI animations
- **Real-time Notifications** - Status updates and feedback
- **Fullscreen Support** - Immersive canvas experience

## 🗂️ Project Structure

```
📦 Interactive Media Assignment/
├── 🌐 **Frontend** (Client-side)
│   ├── 📄 index.html              # Main application
│   ├── 📁 js/                     # JavaScript modules
│   │   ├── ProjectManager.js      # Project management system
│   │   ├── UIController.js        # User interface controller
│   │   ├── APIClient.js          # Backend API integration
│   │   ├── A1A.js                # Project A1A - Basic Shapes
│   │   ├── A1B.js                # Project A1B - Interactive Animation
│   │   └── _ProjectTemplate.js    # Template for new projects
│   ├── 📁 css/
│   │   └── style.css             # Enhanced responsive styles
│   └── 📁 assets/                # Media resources
│       ├── 📁 images/
│       ├── 📁 sounds/
│       └── 📁 fonts/
├── 🚀 **Backend** (Serverless API)
│   ├── 📁 api/
│   │   └── index.js              # Express.js serverless API
│   ├── 📁 utils/
│   │   └── database.js           # Database utilities
│   ├── package.json              # Backend dependencies
│   ├── vercel.json              # Vercel deployment config
│   ├── netlify.toml             # Netlify deployment config
│   └── deploy.sh                # Automated deployment script
├── 📁 docs/                      # Documentation
│   ├── index.md                  # Documentation index
│   ├── design_plans/             # Project design plans
│   ├── project_docs/             # Project management docs
│   ├── progress.md               # Assignment progress tracking
│   └── bug-fixes-summary.md      # Bug fixes history
├── 📁 backup/                    # Version backups
├── 📄 DEPLOYMENT.md              # Cloud deployment guide
└── 📄 README.md                  # This file
```

## 🚀 Quick Start

### 1. **Local Development**

```bash
# Clone and setup
git clone <your-repo>
cd "Interactive Media Assignment"

# Install backend dependencies
cd backend
npm install

# Start development server
npm run dev
```

### 2. **Open Frontend**
- Open `index.html` in your browser
- Or use Live Server extension in VS Code

### 3. **Start Creating!**
- Projects automatically appear as buttons
- Switch between projects seamlessly
- View real-time analytics

## 🎯 Current Projects

### 📐 **A1A - Basic Shapes**
- Fundamental p5.js shape drawing
- Line, square, circle, rectangle demos
- Mouse and keyboard interaction
- **Skills:** Basic p5.js, coordinate system

### 🎪 **A1B - Interactive Animation**
- Bouncing ball with physics
- Mouse trail following
- Dynamic background colors
- Speed controls and reset functionality
- **Skills:** Animation, user interaction, physics

## ➕ Adding New Projects

### Using the Template System:

1. **Copy Template:**
   ```bash
   cp js/_ProjectTemplate.js js/A1C.js
   ```

2. **Customize Project:**
   ```javascript
   // Replace placeholders in A1C.js:
   // [PROJECT_ID] → a1c
   // [PROJECT_NAME] → A1C - Your Project Name
   // [PROJECT_DESCRIPTION] → Your project description
   ```

3. **Add to HTML:**
   ```html
   <script src="js/A1C.js"></script>
   ```

4. **Refresh Page** - New project button appears automatically! 🎉

### Example New Project Ideas:
- **A1C - Particle System** - Advanced particle physics
- **A1D - Interactive Game** - Simple game mechanics
- **A1E - Data Visualization** - Charts and graphs
- **A1F - Sound Reactive** - Audio-visual interactions

## 🌐 Cloud Deployment

### **Production Ready:**
- Serverless backend API
- Global CDN distribution
- Automatic HTTPS
- Real-time analytics

### **Deployment Options:**

#### **Vercel (Recommended):**
```bash
cd backend
npm install -g vercel
vercel --prod
```

#### **Netlify:**
```bash
cd backend
npm install -g netlify-cli
netlify deploy --prod
```

#### **One-Click Deployment:**
```bash
chmod +x backend/deploy.sh
./backend/deploy.sh
```

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide**

## 📊 Backend API

### **Endpoints:**
- `GET /api/health` - Health check
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `POST /api/projects/:id/like` - Like project
- `GET /api/analytics` - View analytics

### **Features:**
- ✅ Project analytics tracking
- ✅ View count monitoring
- ✅ Like system
- ✅ Tag-based filtering
- ✅ Rate limiting & security
- ✅ CORS configuration

## 🎨 Technical Stack

### **Frontend:**
- **p5.js** - Creative coding framework
- **Vanilla JavaScript** - ES6+ modular architecture
- **CSS Grid & Flexbox** - Responsive layout
- **CSS Animations** - Smooth transitions

### **Backend:**
- **Express.js** - Serverless API framework
- **Node.js 18+** - Runtime environment
- **In-memory Storage** - Fast data access (upgradeable to database)
- **Security Middleware** - Helmet, CORS, rate limiting

### **Deployment:**
- **Vercel/Netlify** - Serverless hosting
- **CDN** - Global content delivery
- **CI/CD** - Automated deployments
- **HTTPS** - Automatic SSL certificates

## 📱 Cross-Platform Support

### **Desktop:**
- Full-featured experience
- Keyboard shortcuts
- Multi-window support

### **Mobile & Tablet:**
- Touch-optimized controls
- Responsive canvas sizing
- Mobile-first navigation

### **Offline Mode:**
- Projects work without internet
- Graceful API fallbacks
- Local data persistence

## 🛠️ Development Tools

### **Scripts:**
```bash
npm start          # Start live server
npm run dev        # Development with hot reload
npm run backup     # Create project backup
npm run deploy     # Deploy to production
```

### **VS Code Extensions:**
- Live Server - Local development
- Prettier - Code formatting
- ES6 Snippets - JavaScript productivity

## 📊 Analytics & Insights

### **Real-time Metrics:**
- Project view counts
- User engagement time
- Popular projects ranking
- Tag-based analytics

### **Performance Monitoring:**
- API response times
- Error rate tracking
- Uptime monitoring
- User session analytics

## 🎓 Learning Outcomes

### **Technical Skills:**
- Modular JavaScript architecture
- API integration and design
- Responsive web development
- Cloud deployment workflows
- Version control with Git

### **Creative Skills:**
- Interactive media design
- User experience optimization
- Visual storytelling
- Creative coding techniques

## 🔮 Future Enhancements

- [ ] **User Authentication** - Personal project collections
- [ ] **Real-time Collaboration** - Multi-user editing
- [ ] **Advanced Analytics** - Detailed user insights
- [ ] **File Upload System** - Asset management
- [ ] **Project Sharing** - Social features
- [ ] **Database Integration** - Persistent storage
- [ ] **Mobile App** - Native mobile experience

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the project template system
4. Test thoroughly on multiple devices
5. Submit pull request with detailed description

## 📄 License

MIT License - Build amazing things! 🚀

## 🆘 Support & Resources

- **📚 Documentation:** [docs/index.md](docs/index.md) - Complete project documentation
- **� Design Plans:** [docs/design_plans/](docs/design_plans/) - Technical specifications
- **📋 Project Docs:** [docs/project_docs/](docs/project_docs/) - Management and setup guides
- **📈 Progress:** [docs/progress.md](docs/progress.md) - Development tracking
- **🐛 Bug Fixes:** [docs/bug-fixes-summary.md](docs/bug-fixes-summary.md) - Issue resolution history
- **p5.js Reference:** https://p5js.org/reference/
- **MDN Web Docs:** https://developer.mozilla.org/
- **Vercel Docs:** https://vercel.com/docs
- **Course Materials:** UTS Interactive Media 2025

---

**Ready to create amazing interactive media projects! 🎨✨**

*Built with ❤️ using p5.js | UTS Interactive Media 2025*
