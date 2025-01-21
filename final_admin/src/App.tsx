import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/common/Header';
import Sidebar from './components/common/Sideber';
import Footer from './components/common/Footer';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import FeedList from './pages/Feeds/FeedList';
import FeedForm from './pages/Feeds/FeedForm';
import UserList from './pages/Users/UserList';
import { Login } from './pages/Login';
import InfluencerApplyList from './pages/InfluencerApplyList';

const { Content } = Layout;

const App: React.FC = () => {
  const login = sessionStorage.getItem('user') ?? null;
  const navigate = useNavigate(); // navigate 훅을 사용

  useEffect(() => {
    if (window.location.href.includes('/login')) return;
    if (login === null) {
      navigate('/login'); // window.location.href 대신 navigate를 사용
    }
  }, [login, navigate]); // navigate를 의존성 배열에 추가

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {login && <Sidebar />}
      <Layout>
        <Header />
        <Content style={{ margin: '16px' }}>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />

            <Route path='/users' element={<UserList />} />
            <Route path='/feed' element={<FeedList />} />
            <Route path='/feed/edit/:id' element={<FeedForm />} />
            <Route
              path='/influencer/applies'
              element={<InfluencerApplyList />}
            />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

const AppWithRouter: React.FC = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWithRouter;
