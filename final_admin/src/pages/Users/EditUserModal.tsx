import React from "react";
import { Modal, Form, Input, Button, Spin, Select } from "antd";
import { User } from "../../interfaces";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  user: User | null;
  loading: boolean; // 추가
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, onSave, user, loading }) => {
  const [userForm] = Form.useForm();

  const categoryOptions = [
    { label: "여행", value: "여행" },
    { label: "패션", value: "패션" },
    { label: "음식", value: "음식" },
    { label: "뷰티", value: "뷰티" },
    { label: "음악", value: "음악" },
  ];

  React.useEffect(() => {
    if (user) {
      userForm.resetFields();
      userForm.setFieldsValue({
        username: user.username,
        about_me: user.about_me || "",
        profile_picture: user.profile_picture || "",
        category: user.influencer?.category || "",
        banner_picture: user.influencer?.banner_picture || "",
      });
    }
  }, [user, userForm]);

  return (
    <Modal
      title="회원 정보 수정"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          취소
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => userForm.submit()}>
          저장
        </Button>,
      ]}
    >
      {loading ? <Spin /> : (
        <Form
          form={userForm} 
          onFinish={onSave}
          layout="vertical"
        >
          <Form.Item
            label="닉네임"
            name="username"
            rules={[{ required: true, message: "닉네임을 입력해주세요." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="소개" name="about_me">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="프로필 이미지" name="profile_picture">
            <Input />
          </Form.Item>
          {user?.is_influencer && (
            <>
              <Form.Item label="카테고리" name="category">
                <Select options={categoryOptions} />
              </Form.Item>
              <Form.Item label="배너 이미지" name="banner_picture">
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default EditUserModal;
