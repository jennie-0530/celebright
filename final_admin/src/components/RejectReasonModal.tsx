
import React from 'react';
import { Modal, Input } from 'antd';

interface RejectReasonModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  rejectionReason: string | null;
  setRejectionReason: (reason: string) => void;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  visible,
  onOk,
  onCancel,
  rejectionReason,
  setRejectionReason,
}) => {
  return (
    <Modal
      title="반려 사유 입력"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
    >
      <Input
        type="text"
        value={rejectionReason || ''}
        onChange={(e) => setRejectionReason(e.target.value)}
        placeholder="반려 사유를 입력하세요"
      />
    </Modal>
  );
};

export default RejectReasonModal;