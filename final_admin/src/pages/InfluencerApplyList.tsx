import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal } from 'antd';
import { getInfluencerApplies, approveApplication, rejectApplication } from '../api/requests/influencerApi';
import RejectReasonModal from '../components/RejectReasonModal'; // RejectReasonModal 컴포넌트 가져오기

interface InfluencerApplication {
  id: number;
  user_id: number;
  category: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  banner_picture: string;
  User: {
    id: number;
    username: string;
    email: string;
  };
}

const InfluencerApplyList: React.FC = () => {
  const [applications, setApplications] = useState<InfluencerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null); // 모달에 표시할 이미지
  const [rejectionReason, setRejectionReason] = useState<string | null>(null); // 반려 사유 모달 상태
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await getInfluencerApplies();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveApplication(id);
      alert('신청이 승인되었습니다.');
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async () => {
    if (currentRejectId !== null) {
      try {
        const reason = rejectionReason || '반려 사유 없음';
        await rejectApplication(currentRejectId, reason);
        alert('신청이 반려되었습니다.');
        fetchApplications();
      } catch (error) {
        console.error('Error rejecting application:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
      } finally {
        setIsRejectModalVisible(false);
        setCurrentRejectId(null);
        setRejectionReason(null);
      }
    }
  };

  const showRejectModal = (id: number) => {
    setCurrentRejectId(id);
    setIsRejectModalVisible(true);
  };

  const handleShowReason = (reason: string | null) => {
    setRejectionReason(reason);
  };

  const handleShowBanner = (url: string) => {
    setBannerImage(url);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '신청자 이름',
      dataIndex: ['User', 'username'],
      key: 'username',
    },
    {
      title: '이메일',
      dataIndex: ['User', 'email'],
      key: 'email',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'blue';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: '신청일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => new Date(created_at).toLocaleString(),
    },
    {
      title: '배너 이미지',
      dataIndex: 'banner_picture',
      key: 'banner_picture',
      render: (url: string) => (
        <img
          src={url}
          alt="배너"
          style={{ width: '80px', cursor: 'pointer' }}
          onClick={() => handleShowBanner(url)}
        />
      ),
    },
    {
      title: '액션',
      key: 'action',
      render: (_: any, record: InfluencerApplication) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleApprove(record.id)}
            disabled={record.status !== 'pending'}
          >
            승인
          </Button>
          <Button
            danger
            onClick={() => showRejectModal(record.id)}
            disabled={record.status !== 'pending'}
          >
            반려
          </Button>
          {record.status === 'rejected' && (
            <Button onClick={() => handleShowReason(record.reason)}>반려 사유</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>인플루언서 신청 관리</h1>
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 16 }}
        pagination={{ pageSize: 10 }}
      />
      {/* 배너 이미지 모달 */}
      <Modal
        open={!!bannerImage}
        footer={null}
        onCancel={() => setBannerImage(null)}
        centered
      >
        <img src={bannerImage || ''} alt="배너" style={{ width: '100%' }} />
      </Modal>
      {/* 반려 사유 모달 */}
      <Modal
        open={!!rejectionReason}
        footer={null}
        onCancel={() => setRejectionReason(null)}
        centered
      >
        <p>{rejectionReason || '반려 사유가 없습니다.'}</p>
      </Modal>
      {/* 반려 사유 입력 모달 */}
      <RejectReasonModal
        visible={isRejectModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectModalVisible(false)}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
      />
    </div>
  );
};

export default InfluencerApplyList;
