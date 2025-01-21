import React, { useLayoutEffect, useState } from 'react';
import { Form, Input, Button, Select, Typography, Space, Card } from 'antd';
import FeedImages from '../../components/Feed/FeedImag';
import Recommendations from '../../components/Feed/Recommendations';
import { feedGet, feedUpdate } from '../../api/requests/feedApi';
import { useNavigate, useParams } from 'react-router-dom';
type Product = {
  img: null;
  link: string;
  title: string;
  [key: string]: any; // 동적 속성 허용
};
const { Title } = Typography;
const { Option } = Select;

const PostForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigator = useNavigate();
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState('단일공개');
  const [postImages, setPostImages] = useState<File[]>([]);
  const [productImgs, setProductImgs] = useState([
    { img: null, link: '', title: '' },
  ]);
  // 수정 데이터 가져오기
  useLayoutEffect(() => {
    const fetchData = async () => {
      const data = await feedGet(id as string);
      setProductImgs(data.products);
      setPostImages(data.images);
      setGrade(data.visibility_level);
      setDescription(data.content);
    };
    fetchData();
  }, [id]);
  // imgs 썸네일부분
  const handleAddPostImage = (file: File) =>
    setPostImages([...postImages, file]);
  const handleRemovePostImage = (index: number) =>
    setPostImages(postImages.filter((_, i) => i !== index));

  const handleProductChange = (index: number, field: string, value: any) => {
    const updatedProducts: Product[] = [...productImgs];
    updatedProducts[index][field] = value;
    setProductImgs(updatedProducts);
  };

  const addProduct = () =>
    setProductImgs([...productImgs, { img: null, link: '', title: '' }]);
  const removeProduct = (index: number) =>
    setProductImgs(productImgs.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const formData = new FormData();
    postImages.forEach((image) => formData.append('postImages', image));
    productImgs.forEach((product) => {
      if (product.img) formData.append('productImgs', product.img);
      formData.append('productImgsLink', product.link);
      formData.append('productImgsTitle', product.title);
    });
    formData.append('description', description);
    formData.append('grade', grade);

    const res = await feedUpdate(id as string, formData);
    if (res?.status === 200) {
      alert(res.data.message);
      navigator('/');
    }
  };

  return (
    <Card style={{ maxWidth: '100%', margin: 'auto', marginTop: 20 }}>
      <Card style={{ width: '60%', margin: 'auto' }}>
        <Title level={3} style={{ textAlign: 'center' }}>
          게시글 수정하기
        </Title>

        <Form layout='vertical' onFinish={handleSubmit}>
          <Space
            direction='vertical'
            size='large'
            style={{ width: '100%', paddingTop: '10px' }}
          >
            <Form.Item>
              <FeedImages
                feedImages={postImages}
                onAddImage={handleAddPostImage}
                onRemoveImage={handleRemovePostImage}
              />
            </Form.Item>

            <Form.Item label='내용'>
              <Input.TextArea
                rows={4}
                placeholder='내용'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Item>

            <Form.Item label='공개 범위'>
              <Select
                value={grade}
                onChange={setGrade}
                style={{ width: '100%' }}
              >
                <Option value='3'>단일공개</Option>
                <Option value='2'>개별공개</Option>
                <Option value='1'>전체공개</Option>
              </Select>
            </Form.Item>

            <Form.Item label='추천 상품'>
              <Recommendations
                Feeds={productImgs}
                onAddFeed={addProduct}
                onRemoveFeed={removeProduct}
                onFeedsChange={handleProductChange}
              />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' block>
                수정하기
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </Card>
  );
};

export default PostForm;
