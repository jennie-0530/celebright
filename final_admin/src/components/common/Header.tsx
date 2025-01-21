import React from 'react';
import { Layout, Typography } from 'antd';

const { Header } = Layout;
const { Title } = Typography;

const CustomHeader: React.FC = () => (
  <Header style={{ background: '#f0f2f5', padding: '0 16px' }}>
    <Title level={4} style={{ margin: 0 }}>
      Celebright Dashboard
    </Title>
  </Header>
);

export default CustomHeader;
