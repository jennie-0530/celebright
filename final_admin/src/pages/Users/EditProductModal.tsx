import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Typography, Space, Button, Spin } from "antd";
import { MembershipProduct } from "../../interfaces";

const { Text } = Typography;

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  product: MembershipProduct | null;
  allProducts: MembershipProduct[]; // 추가: 같은 인플루언서의 모든 상품 리스트
  loading: boolean; // 추가
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  open,
  onClose,
  onSave,
  product,
  allProducts,
  loading, // 추가
}) => {
  const [productForm] = Form.useForm();
  const [imagePreview, setImagePreview] = useState<string>("");

  React.useEffect(() => {
    if (product) {
      productForm.setFieldsValue({
        ...product,
        benefits: product.benefits.join(", "),
      });
      setImagePreview(product.image || ""); // 초기 이미지 설정
    }
  }, [product, productForm]);

  const handleSave = (values: any) => {
    const updatedBenefits = values.benefits
      ? values.benefits.split(",").map((benefit: string) => benefit.trim())
      : [];
    onSave({
      ...values,
      benefits: updatedBenefits,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagePreview(e.target.value); // 이미지 URL 미리보기 업데이트
  };

  return (
    <Modal
      title="멤버십 상품 수정"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          취소
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => productForm.submit()}>
          저장
        </Button>,
      ]}
      centered
      style={{ padding: "24px" }}
    >
      {loading ? <Spin /> : (
        <Form
          form={productForm}
          onFinish={handleSave}
          layout="vertical"
          style={{ maxWidth: 600, margin: "0 auto" }}
        >
          <Form.Item label="이름" name="name" rules={[{ required: true, message: "이름을 입력해주세요." }]}>
            <Input placeholder="상품 이름 입력" />
          </Form.Item>
          <Form.Item
            label="가격"
            name="price"
            rules={[{ required: true, message: "가격을 입력해주세요." }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="가격 입력"
            />
          </Form.Item>
          <Form.Item label="혜택" name="benefits">
            <Input placeholder="혜택을 쉼표로 구분하여 입력" />
          </Form.Item>
          <Form.Item label="이미지 URL" name="image">
            <Input
              placeholder="이미지 URL 입력"
              onChange={handleImageChange}
            />
          </Form.Item>
          {imagePreview && (
            <Space
              direction="vertical"
              style={{ textAlign: "center", width: "100%", marginTop: 16 }}
            >
              <Text strong>이미지 미리보기</Text>
              <img
                src={imagePreview}
                alt="Product Preview"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Space>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default EditProductModal;
