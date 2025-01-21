import React from "react";
import { Drawer, Tabs, Space, Avatar, Button, Row, Col, Card, Switch, List, Spin } from "antd";
import { User, MembershipProduct } from "../../interfaces";

const { Meta } = Card;

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onEditUser: () => void;
  onEditProduct: (product: MembershipProduct) => void;
  onToggleProductStatus: (product: MembershipProduct) => void;
  loading: boolean; // 추가
}

const UserDrawer: React.FC<UserDrawerProps> = ({
  open,
  onClose,
  user,
  onEditUser,
  onEditProduct,
  onToggleProductStatus,
  loading, // 추가
}) => {
  const getAllBenefits = (product: MembershipProduct, allProducts: MembershipProduct[]): string[] => {
    const lowerLevelBenefits = allProducts
      .filter((p) => p.level < product.level) // 하위 레벨 필터링
      .flatMap((p) => p.benefits); // 혜택 병합
    return Array.from(new Set([...lowerLevelBenefits, ...product.benefits])); // 중복 제거
  };

  return (
    <Drawer placement="right" onClose={onClose} open={open} width={800}>
      {loading ? <Spin /> : (
        user && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: "정보",
                children: (
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Avatar
                      size={128}
                      src={user.profile_picture || undefined}
                      alt="프로필 이미지"
                      style={{ border: "2px solid #1890ff", padding: "4px" }}
                    />
                    <div>
                      <strong>닉네임:</strong> {user.username}
                    </div>
                    <div>
                      <strong>이메일:</strong> {user.email}
                    </div>
                    <div>
                      <strong>소개:</strong> {user.about_me || "미입력"}
                    </div>
                    {user.is_influencer && (
                      <>
                        <div>
                          <strong>카테고리:</strong> {user.influencer?.category || "미입력"}
                        </div>
                        <img
                          src={user.influencer?.banner_picture || ""}
                          alt="배너"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </>
                    )}
                    <Button type="primary" onClick={onEditUser}>
                      정보 수정
                    </Button>
                  </Space>
                ),
              },
              ...(user?.is_influencer
                ? [
                    {
                      key: "2",
                      label: "멤버십 관리",
                      children: (
                        <Row gutter={[24, 24]}>
                          {user.influencer?.products.map((product) => (
                            <Col key={product.id} xs={24} sm={12} md={8}>
                              <Card
                                hoverable
                                title={
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    {/* 수정 버튼 */}
                                    <Button
                                      type="link"
                                      onClick={() => onEditProduct(product)}
                                      style={{
                                        padding: 0,
                                        fontSize: "14px",
                                      }}
                                    >
                                      수정
                                    </Button>

                                    {/* 토글 버튼 */}
                                    <Switch
                                      checked={product.is_active}
                                      onChange={() => onToggleProductStatus(product)}
                                    />
                                  </div>
                                }
                                cover={
                                  product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      style={{
                                        height: 180,
                                        objectFit: "cover",
                                        borderTopLeftRadius: 8,
                                        borderTopRightRadius: 8,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        height: 180,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f0f0f0",
                                        color: "#999",
                                      }}
                                    >
                                      이미지가 없습니다.
                                    </div>
                                  )
                                }
                              >
                                <Meta
                                  title={product.name}
                                  description={
                                    <>
                                      <p>가격: {product.price.toLocaleString()}원</p>
                                      <List
                                        size="small"
                                        header={<strong>혜택 목록</strong>}
                                        bordered
                                        dataSource={getAllBenefits(
                                          product,
                                          user.influencer?.products || []
                                        )}
                                        renderItem={(item) => <List.Item>{item}</List.Item>}
                                        style={{ marginTop: 8 }}
                                      />
                                    </>
                                  }
                                />
                              </Card>

                            </Col>
                          ))}
                        </Row>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )
      )}
    </Drawer>
  );
};

export default UserDrawer;
