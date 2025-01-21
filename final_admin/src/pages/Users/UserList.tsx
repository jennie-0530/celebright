import React, { useState, useEffect } from "react";
import { Table, message, Button, Tag, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import UserDrawer from "./UserDrawer";
import EditUserModal from "./EditUserModal";
import EditProductModal from "./EditProductModal";
import { fetchAllUsers, updateUser, updateProduct, toggleProductStatusApi } from "../../api";
import { User, MembershipProduct } from "../../interfaces";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [productForm] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editUserVisible, setEditUserVisible] = useState(false);
  const [editProductVisible, setEditProductVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<MembershipProduct | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [filterType, setFilterType] = useState<"all" | "influencer" | "user">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      if (filterType === "influencer") return user.is_influencer;
      if (filterType === "user") return !user.is_influencer;
      return true;
    }).filter((user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchText, users, filterType]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await fetchAllUsers();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDrawer = (user: User) => {
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedUser(null);
  };

  const openEditUserModal = () => {
    if (selectedUser) {
      userForm.setFieldsValue({
        username: selectedUser.username,
        about_me: selectedUser.about_me || "",
        profile_picture: selectedUser.profile_picture || "",
        category: selectedUser.influencer?.category || "",
        banner_picture: selectedUser.influencer?.banner_picture || "",
      });
      setEditUserVisible(true);
    }
  };

  const closeEditUserModal = () => {
    setEditUserVisible(false);
  };

  const handleSaveUser = async (values: any) => {
    setActionLoading(true);
    try {
      if (!selectedUser) return;

      const updatedUser = { ...selectedUser, ...values };

      await updateUser(selectedUser.id, updatedUser);

      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)));

      message.success("회원 정보가 성공적으로 업데이트되었습니다.");
      closeEditUserModal();
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("회원 정보 업데이트에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditProductModal = (product: MembershipProduct) => {
    setCurrentProduct(product);
    productForm.setFieldsValue({
      ...product,
      benefits: product.benefits.join(", "),
    });
    setEditProductVisible(true);
  };

  const closeEditProductModal = () => {
    setEditProductVisible(false);
  };

  const handleSaveProduct = async (values: any) => {
    setActionLoading(true);
    try {
      if (!currentProduct) return;

      const updatedProduct = { ...currentProduct, ...values };

      await updateProduct(currentProduct.id, updatedProduct);

      setSelectedUser((prev) => {
        if (!prev || !prev.influencer) return prev;
        return {
          ...prev,
          influencer: {
            ...prev.influencer,
            products: prev.influencer.products.map((p) =>
              p.id === currentProduct.id ? updatedProduct : p
            ),
          },
        };
      });

      message.success("상품이 성공적으로 업데이트되었습니다.");
      closeEditProductModal();
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("상품 업데이트에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleProductStatus = async (product: MembershipProduct) => {
    setActionLoading(true);
    try {
      const updatedProduct = await toggleProductStatusApi(product.id);

      setSelectedUser((prev) => {
        if (!prev || !prev.influencer) return prev;
        return {
          ...prev,
          influencer: {
            ...prev.influencer,
            products: prev.influencer.products.map((p) =>
              p.id === product.id ? { ...p, is_active: updatedProduct.is_active } : p
            ),
          },
        };
      });

      message.success("상태가 변경되었습니다.");
    } catch (error) {
      console.error("Error toggling product status:", error);
      message.error("상태 변경에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as "all" | "influencer" | "user");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 50, sorter: (a: User, b: User) => a.id - b.id, align: "center" as "center" },
    {
      title: "프로필",
      dataIndex: "profile_picture",
      key: "profile_picture",
      render: (url: string | null) =>
        url ? <img src={url} alt="프로필" style={{ width: "40px", borderRadius: "50%" }} /> : "없음",
      width: 50,
      align: "center" as "center",
    },
    {
      title: "닉네임",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
      width: 120,
      sorter: (a: User, b: User) => a.username.localeCompare(b.username),
      align: "center" as "center",
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 150,
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
      align: "center" as "center",
    },
    {
      title: "가입일",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at: string) => dayjs(created_at).format("YYYY-MM-DD HH:mm"),
      width: 100,
      sorter: (a: User, b: User) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      align: "center" as "center",
    },
    {
      title: "타입",
      key: "status",
      render: (_: any, record: User) =>
        record.is_influencer ? <Tag color="green">인플루언서</Tag> : <Tag color="blue">일반 유저</Tag>,
      width: 50,
      sorter: (a: User, b: User) => Number(b.is_influencer) - Number(a.is_influencer),
      align: "center" as "center",
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: User) => (
        <Button type="link" onClick={() => handleShowDrawer(record)}>
          상세 정보
        </Button>
      ),
      width: 50,
      align: "center" as "center",
    },
  ];

  return (
    <div style={{ padding: "0 20px" }}>
      <h1>유저 관리</h1>
      <div style={{  marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <Input.Search
    placeholder="닉네임 검색"
    allowClear
    value={searchText}
    onChange={handleSearch}
    style={{ width: "300px" }}
  />
  <Select
    defaultValue={filterType}
    style={{ width: "120px" }}
    onChange={(value) => setFilterType(value as "all" | "influencer" | "user")}
  >
    <Select.Option value="all">전체</Select.Option>
    <Select.Option value="influencer">인플루언서</Select.Option>
    <Select.Option value="user">일반 유저</Select.Option>
  </Select>
</div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <UserDrawer
        open={drawerVisible}
        onClose={closeDrawer}
        user={selectedUser}
        onEditUser={openEditUserModal}
        onEditProduct={openEditProductModal}
        onToggleProductStatus={toggleProductStatus}
        loading={actionLoading} // 추가
      />
      <EditUserModal
        open={editUserVisible}
        onClose={closeEditUserModal}
        onSave={handleSaveUser}
        user={selectedUser}
        loading={actionLoading} // 추가
      />
      <EditProductModal
        open={editProductVisible}
        onClose={closeEditProductModal}
        onSave={handleSaveProduct}
        product={currentProduct}
        allProducts={selectedUser?.influencer?.products || []}
        loading={actionLoading} // 추가
      />
    </div>
  );
};

export default UserList;
