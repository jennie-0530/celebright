import React from 'react';
import { Row, Col, Input, Button, Upload, Image, Space } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

type Feed = { img: File | null; link: string; title: string };

type FeedRecommendationsProps = {
  Feeds: Feed[];

  onAddFeed: () => void;
  onRemoveFeed: (index: number) => void;
  onFeedsChange: (index: number, field: string, value: any) => void;
};

const FeedRecommendations: React.FC<FeedRecommendationsProps> = ({
  Feeds,

  onAddFeed,
  onRemoveFeed,
  onFeedsChange,
}) => {
  return (
    <div>
      {Feeds.map((feed, index) => (
        <Row
          key={index}
          gutter={16}
          align='middle'
          style={{ marginBottom: 16 }}
        >
          <Col span={4}>
            {feed.img ? (
              <Image
                src={
                  typeof feed.img === 'string'
                    ? feed.img
                    : URL.createObjectURL(feed.img)
                }
                alt={`product-preview-${index}`}
                width={100}
                height={100}
                style={{ borderRadius: 4 }}
              />
            ) : (
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  onFeedsChange(index, 'img', file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>업로드</Button>
              </Upload>
            )}
          </Col>
          <Col span={8}>
            <Input
              placeholder='제품명'
              value={feed.title}
              onChange={(e) => onFeedsChange(index, 'title', e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Input
              placeholder='링크'
              value={feed.link}
              onChange={(e) => onFeedsChange(index, 'link', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Button
              type='primary'
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemoveFeed(index)}
            />
          </Col>
        </Row>
      ))}
      <Button type='dashed' icon={<UploadOutlined />} onClick={onAddFeed} block>
        추천 제품 추가
      </Button>
    </div>
  );
};

export default FeedRecommendations;
