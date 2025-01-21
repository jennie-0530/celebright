import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Input, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { feedDelete, getFeeds } from '../../api/requests/feedApi'; // API 호출 함수 import
import { tryParseJson } from '../../util/tryParseJson';
import debounce from 'lodash/debounce'; // Lodash의 debounce 함수 import

const { Search } = Input;

interface Post {
  id: number;
  title: string;
  content: string;
  influencer: string;
  created_at: string;
  modified_at: string;
}

const PostList: React.FC = () => {
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<Post[]>([]); // 초기 상태는 빈 배열
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태
  const [apiCall, setApiCall] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); // 검색어 상태

  // 페이지 로드 시 피드 목록 가져오기
  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        const fetchedFeeds = await getFeeds(); // 피드 목록 가져오기
        setFeeds(fetchedFeeds); // 가져온 피드로 상태 업데이트
      } catch (error) {
        console.error('Failed to fetch feeds:', error);
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    fetchFeeds();
  }, [apiCall]);

  const onDelete = async (id: string) => {
    try {
      await feedDelete(id);
      setApiCall(!apiCall);
    } catch (error) {
      console.error('Failed to delete feed:', error);
    }
  };

  // 검색어에 따라 feeds를 필터링
  const filteredFeeds = feeds.filter((feed) => {
    const contentMatch = feed.content
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const influencerMatch = feed.influencer
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return contentMatch || influencerMatch;
  });

  // 디바운스를 적용한 검색 함수
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value); // 검색어 상태를 변경
    }, 500), // 500ms 딜레이 설정
    []
  );

  const columns = [
    {
      title: '썸네일',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (src: string) => {
        const images = tryParseJson(src);
        return (
          <div style={{ maxWidth: 50, overflow: 'hidden' }}>
            {images && images[0] ? (
              <img
                src={images[0]}
                alt='Thumbnail'
                style={{ width: '100%', height: 'auto' }}
              />
            ) : (
              <span>No image</span>
            )}
          </div>
        );
      },
    },
    {
      title: '작성자',
      dataIndex: 'influencer',
      key: 'influencer',
      width: 60,
      render: (influencer: string) => (
        <span
          style={{
            display: 'inline-block',

            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {influencer}
        </span>
      ),
    },
    {
      title: '내용',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (content: string) => (
        <span
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {content}
        </span>
      ),
    },
    {
      title: '작성일',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (text: string) => {
        const date = new Date(text);
        return <Tag color='blue'>{date.toLocaleString()}</Tag>;
      },
    },
    {
      title: '수정일',
      dataIndex: 'modified_at',
      key: 'modified_at',
      width: 120,
      render: (text: string) => {
        const date = new Date(text);
        return <Tag color='blue'>{date.toLocaleString()}</Tag>;
      },
    },
    {
      title: '액션',
      key: 'action',
      width: 100,
      render: (_: any, record: Post) => (
        <Space>
          <Button
            type='primary'
            onClick={() => navigate(`/feed/edit/${record.id}`)}
          >
            수정
          </Button>
          <Button danger onClick={() => onDelete(String(record.id))}>
            삭제
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <h1 style={{ marginBottom: 16 }}>게시글 관리</h1>

      {/* 검색 입력창 */}
      <Search
        placeholder='작성자, 내용을 입력하세요'
        onChange={(e) => debouncedSearch(e.target.value)} // 디바운스 적용
        style={{ width: 300, marginBottom: 16 }}
      />

      {/* 로딩 중일 때 로딩 표시 */}
      {loading ? (
        <Spin tip='로딩 중...' />
      ) : filteredFeeds.length === 0 ? (
        <div>검색된 결과가 없습니다.</div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredFeeds}
          rowKey='id'
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
};

export default PostList;
