import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  {
    key: '1',
    icon: <DashboardOutlined />,
    label: <Link to='/'>Dashboard</Link>,
  },
  {
    key: '2',
    icon: <UserOutlined />,
    label: <Link to='/users'>Users</Link>,
  },
  {
    key: '3',
    icon: <FileTextOutlined />,
    label: <Link to='/feed'>Feed</Link>,
  },
  {
    key: '4',
    icon: <FileTextOutlined />,
    label: <Link to='/influencer/applies'>Influencer Applies</Link>,
  },
  {
    key: '5',
    icon: <SettingOutlined />,
    label: <Link to='/settings'>Settings</Link>,
  },
];

const Sidebar: React.FC = () => (
  <Sider collapsible>
    <div
      style={{
        height: 64,
        background: 'rgba(255, 255, 255, 0.2)',
        margin: '16px',
      }}
    />
    <Menu theme='dark' mode='inline' items={menuItems} />
  </Sider>
);
export default Sidebar;
