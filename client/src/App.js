import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import UserInputPage from './pages/UserInputPage';
import LoadingPage from './pages/LoadingPage';
import FortuneInfoPage from './pages/FortuneInfoPage';
import CalculatingPage from './pages/CalculatingPage';
import ResultPage from './pages/ResultPage';
import AIAdvicePage from './pages/AIAdvicePage';
import MyInfoPage from './pages/MyInfoPage';

function App() {
  return (
    <AuthProvider>
      <Router>
    <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/input" element={<UserInputPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/fortune-info" element={<FortuneInfoPage />} />
            <Route path="/calculating" element={<CalculatingPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/advice" element={<AIAdvicePage />} />
            <Route path="/myinfo" element={<MyInfoPage />} />
          </Routes>
    </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
