import React, { useEffect, useState } from 'react';
import { Upload } from 'antd';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

type FeedImagesProps = {
  feedImages: Array<File | string>;
  onAddImage: (file: File) => void;
  onRemoveImage: (index: number) => void;
};

const FeedImages: React.FC<FeedImagesProps> = ({
  feedImages,
  onAddImage,
  onRemoveImage,
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = feedImages.map((file) =>
      typeof file === 'string' ? file : URL.createObjectURL(file)
    );
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [feedImages]);

  return (
    <div>
      <Swiper
        navigation
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        style={{ width: '100%', height: 300 }}
      >
        {previewUrls.map((url, index) => (
          <SwiperSlide
            key={index}
            style={{ position: 'relative', textAlign: 'center' }}
          >
            <img
              src={url}
              alt={`preview-${index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
            <CloseCircleOutlined
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: 'red',
                fontSize: 24,
                cursor: 'pointer',
                background: 'white',
                borderRadius: '50%',
              }}
              onClick={() => onRemoveImage(index)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center', // 가로축 가운데 정렬
          marginTop: 16,
          width: '100%',
        }}
      >
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            onAddImage(file);
            return false; // 파일 업로드 방지 (수동 처리)
          }}
        >
          <div
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid #000000',
              borderRadius: '10px',
              padding: 5,
              fontSize: 16,
              width: '130px',
            }}
          >
            <PlusOutlined /> 이미지 추가
          </div>
        </Upload>
      </div>
    </div>
  );
};

export default FeedImages;
