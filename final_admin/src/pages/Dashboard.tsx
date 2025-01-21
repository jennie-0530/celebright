import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  UserOutlined,
  ProfileOutlined,
  TeamOutlined,
  CrownOutlined,
  EditOutlined,
} from '@ant-design/icons';
import axiosInstance from '../api/client';

interface Stats {
  todayUserCount: number;
  totalUserCount: number;
  feedCount: number;
  influencerCount: number;
  todayFeedCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/admin');
        setStats(res.data);
      } catch (error) {
        message.error('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Spin
        tip='Loading...'
        style={{ display: 'block', marginTop: '50px', textAlign: 'center' }}
      />
    );
  }

  return (
    <Card
      title='Dashboard'
      bordered={false}
      style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        minHeight: '100vh',
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
            <Statistic
              title='오늘 가입한 사용자'
              value={stats?.todayUserCount || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic
              title='전체 사용자 수'
              value={stats?.totalUserCount || 0}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card style={{ backgroundColor: '#fff7e6', borderColor: '#ffd591' }}>
            <Statistic
              title='전체 피드 수'
              value={stats?.feedCount || 0}
              prefix={<ProfileOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card style={{ backgroundColor: '#fff0f6', borderColor: '#ffadd2' }}>
            <Statistic
              title='인플루언서 수'
              value={stats?.influencerCount || 0}
              prefix={<CrownOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card style={{ backgroundColor: '#f0f5ff', borderColor: '#adc6ff' }}>
            <Statistic
              title='오늘 작성된 피드 수'
              value={stats?.todayFeedCount || 0}
              prefix={<EditOutlined style={{ color: '#2f54eb' }} />}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default Dashboard;
