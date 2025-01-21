import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Create as CreateIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { ReactComponent as CelebrightLogo } from './celebrightLogo.svg';
import { logout } from '../../api/requests/authApi';
import { useLoggedInUserStore } from '../../store/authStore';
import Badge from '@mui/material/Badge';
import socket from "../../util/socket_noti";
import logo from './logo.png';

const NewNavbar = () => {
  const loggedInUser = useLoggedInUserStore((state) => state.loggedInUser);
  const setLoggedInUser = useLoggedInUserStore(
    (state) => state.setLoggedInUser
  );
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, [setLoggedInUser]);

  useEffect(() => {
    socket.on("new_notification", (data: Notification) => {
      console.log("Received new_notification event:", data);
      setNotifications((prev) => [...prev, data]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // 서버 로그아웃 요청
      localStorage.removeItem('user');
      setLoggedInUser(null);
      navigate('/'); // 홈으로 이동
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleClearNotifications = () => {
    setUnreadCount(0);
  };

  const generateMenuItems = () => {
    const baseMenu = [
      { name: '홈', link: '/', icon: <HomeIcon /> },
      { name: '검색', link: '/search', icon: <SearchIcon /> },
    ];

    if (loggedInUser) {
      baseMenu.push(
        {
          name: "알림", link: "/noti", icon: (
            <Badge badgeContent={unreadCount} color="primary">
              <NotificationsIcon onClick={handleClearNotifications} />
            </Badge>
          )
        },
        { name: "작성하기", link: "/write", icon: <CreateIcon /> },
        { name: "채팅하기", link: "/room", icon: <SendIcon /> },
        { name: "마이페이지", link: "/mypage", icon: <PersonIcon /> },
      );
    }
    return baseMenu;
  };

  const menuItems = generateMenuItems();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: '32px',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        backgroundColor: 'white',

        padding: '36px',
        marginTop: '32px',

        borderRadius: "18px",
        boxShadow: "rgba(153, 129, 172, 0.2) 0px 7px 18px 0px",
      }}
    >
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 로고 */}
        <ListItem disablePadding sx={{ marginTop: '5%', marginBottom: '10%' }}>
          <ListItemButton
            component={RouterLink}
            to='/'
            sx={{
              justifyContent: 'center',
              '&:hover': {
                backgroundColor: 'transparent', // 호버 시 바탕색 없애기
              },

            }}
          >
            {/* <CelebrightLogo /> */}
            <Box
              component="img"
              src={logo}
              alt="Celebright Logo"
              sx={{
                width: '100%',   // 원하는 로고 너비 설정
                height: 'auto',   // 높이를 비율에 맞게 자동 설정
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* 메뉴 아이템 */}
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{
              marginTop: '5%',
              marginBottom: '5%',
              justifyContent: 'center',
            }}
          >
            <ListItemButton
              component={RouterLink}
              to={item.link}
              sx={{
                justifyContent: 'center',
                borderRadius: '16px',
                '&:hover .MuiListItemIcon-root, &:focus .MuiListItemIcon-root, &:active .MuiListItemIcon-root': {
                  color: 'primary.main', // 호버, 포커스, 액티브 시 아이콘 색상 변경
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', marginRight: '8px' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} sx={{ textAlign: 'center' }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* 로그인/로그아웃 */}
        {loggedInUser ? (
          <ListItem disablePadding sx={{ marginTop: '5%', marginBottom: '5%' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                justifyContent: 'center',
                borderRadius: '16px',
                '&:hover .MuiListItemIcon-root, &:focus .MuiListItemIcon-root, &:active .MuiListItemIcon-root': {
                  color: 'primary.main', // 호버, 포커스, 액티브 시 아이콘 색상 변경
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', marginRight: '8px' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary='로그아웃' sx={{ textAlign: 'center' }} />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding sx={{ marginTop: '5%', marginBottom: '5%' }}>
            <ListItemButton
              component={RouterLink}
              to='/login'
              sx={{
                justifyContent: 'center',
                borderRadius: '16px',
                '&:hover .MuiListItemIcon-root, &:focus .MuiListItemIcon-root, &:active .MuiListItemIcon-root': {
                  color: 'primary.main', // 호버, 포커스, 액티브 시 아이콘 색상 변경
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', marginRight: '8px' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary='로그인' sx={{ textAlign: 'center' }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default NewNavbar;
