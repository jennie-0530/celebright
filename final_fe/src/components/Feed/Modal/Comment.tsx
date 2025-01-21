import { Box, Button, Typography, TextField, Avatar } from '@mui/material';
import React, { useState } from 'react';
import axios from 'axios';
import { useFeedStore } from '../../../store/feedStore';
import axiosInstance from '../../../api/client';

interface Message {
  id: number;
  sender: string;
  text: string;
  user?: { username: string; profile_picture: string };
  parent_comment_id?: number;
  User?: { username: string; profile_picture: string };
  user_id?: string;
  content?: string;
}

interface CommentProps {
  userId: string;
  message: Message;
  handleCommentModify: (index: number) => void;
  handleCommentDelete: (index: number) => void;
  index: number;
  handleReply: (newReply: Message) => void;
  setReplies: React.Dispatch<React.SetStateAction<Message[]>>;
  replies: Message[];
}

const saveCommentToDb = async (
  comment: Message,
  userId: string,
  postId: string | null
) => {
  try {
    const response = await axiosInstance.post('/comment', {
      user_id: userId,
      post_id: postId,
      parent_comment_id: comment.parent_comment_id,
      content: comment.text,
    });
    console.log(response, 'ddd');

    if (!response.data) {
      throw new Error('댓글 저장 실패');
    }
    return response.data;
  } catch (error) {
    console.error('댓글 저장 중 오류 발생:', error);
    throw error;
  }
};

const Comment: React.FC<CommentProps> = ({
  userId,
  message,
  handleCommentModify,
  handleCommentDelete,
  index,
  handleReply,
  setReplies,
  replies,
}) => {
  const [replyInput, setReplyInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const postId = sessionStorage.getItem('page') ?? null;
  const isOwner = message.sender === userId.toString();

  // 대댓글의 가시성
  const [showReplies, setShowReplies] = useState(false);
  // "댓글확인" 버튼 클릭 시 대댓글 표시
  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyInput(e.target.value);
  };

  const handleReplyDelete = async (replyId: number) => {
    try {
      const response = await axiosInstance.delete(`/comment/${replyId}`);
      if (response.data.success) {
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.id !== replyId)
        );
      }
    } catch (error) {
      console.error('대댓글 삭제 실패:', error);
    }
  };

  const handleReplySubmit = async () => {
    if (postId === null) return;
    if (replyInput.trim() !== '') {
      const newReply: Message = {
        id: Date.now(),
        sender: userId.toString(),
        text: replyInput.trim(),
        parent_comment_id: message.id,
      };
      try {
        const savedComment = await saveCommentToDb(newReply, userId, postId);
        setReplies((prevReplies) => [...prevReplies, savedComment]);
        handleReply(savedComment);
        setReplyInput('');
        setIsReplying(false);
      } catch (error) {
        console.error('댓글 저장 실패:', error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleReplySubmit();
    }
  };

  const handleReplyEdit = (replyId: number, content: string) => {
    setEditingReplyId(replyId);
    setEditReplyContent(content);
  };

  const handleReplyEditSubmit = async (replyId: number) => {
    try {
      const response = await axiosInstance.patch(`/comment/${replyId}`, {
        content: editReplyContent,
      });
      if (response.data.success) {
        setReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply.id === replyId
              ? { ...reply, content: editReplyContent }
              : reply
          )
        );
        setEditingReplyId(null);
        setEditReplyContent('');
      }
    } catch (error) {
      console.error('대댓글 수정 실패:', error);
    }
  };

  const handleReplyEditCancel = () => {
    setEditingReplyId(null);
    setEditReplyContent('');
  };
  console.log(message, 'messagemessagemessage');

  return (
    <Box sx={{ padding: '0px 5px' }}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          mb: '5px',
        }}
      >
        {/* 닉네임 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            width: '25%',
          }}
        >
          <Avatar
            src={message.user?.profile_picture}
            sx={{
              width: 24,
              height: 24,
            }}
          ></Avatar>
          <Typography
            variant='subtitle2'
            sx={{
              paddingLeft: '6%',
              // fontWeight: 'bold',
              color: '#555',
              fontSize: '14px',
            }}
          >
            {message?.user?.username || '익명'}
          </Typography>
        </Box>

        {/* 신고+댓글 버튼 */}
        <Box
          sx={{
            width: '90%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* {!isOwner && (
            <Button
              sx={{
                border: '1px solid #9252E7',
                fontSize: '14px',
                margin: '0 5px',
                padding: '0',
                minWidth: '40px',
                borderRadius: '10px',
                color: '#9252E7',
                cursor: 'pointer',
              }}
            >
              신고
            </Button>
          )} */}
          {isOwner && (
            <>
              <Button
                onClick={() => {
                  setIsReplying(true);
                  handleCommentModify(index);
                }}
                sx={{
                  border: '1px solid #9252E7',
                  fontSize: '14px',
                  margin: '0 5px',
                  padding: '0',
                  minWidth: '40px',
                  borderRadius: '10px',
                  color: '#9252E7',
                  cursor: 'pointer',
                }}
              >
                수정
              </Button>
              <Button
                onClick={() => handleCommentDelete(index)}
                sx={{
                  border: '1px solid #9252E7',
                  fontSize: '14px',
                  margin: '0 5px',
                  padding: '0',
                  minWidth: '40px',
                  borderRadius: '10px',
                  color: '#9252E7',
                  cursor: 'pointer',
                }}
              >
                삭제
              </Button>
            </>
          )}
        </Box>
      </Box>
      <Typography variant='body2'>{message.text}</Typography>

      {/* 대댓글 */}
      {isReplying && (
        <Box sx={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
          <TextField
            placeholder='대댓글을 입력하세요'
            size='small'
            value={replyInput}
            onChange={handleReplyChange}
            onKeyPress={handleKeyPress}
            sx={{
              flexGrow: 1,
              '& .MuiInputBase-root': {
                height: '32px',
                fontSize: '0.875rem',
              },
            }}
          />
          <Button
            onClick={handleReplySubmit}
            sx={{
              border: '1px solid #9252E7',
              fontSize: '14px',
              margin: '0 5px',
              padding: '0',
              minWidth: '40px',
              borderRadius: '10px',
              color: '#9252E7',
              cursor: 'pointer',
            }}
          >
            전송
          </Button>
        </Box>
      )}
      {/* 대댓글 ---------------------------------*/}
      {/* 대댓글 표시/숨기기 버튼 */}
      {replies.length > 0 && (
        <Button
          onClick={toggleReplies}
          sx={{
            textTransform: 'none',
            color: '#9252E7',
            padding: '0',
            paddingRight: '1%',
            fontSize: '14px',
            marginTop: '5px',
          }}
        >
          {showReplies ? '답글 숨기기' : `답글 확인 (${replies.length})`}
        </Button>
      )}
      {!isReplying && (
        <Button
          onClick={() => setIsReplying(true)}
          sx={{
            padding: '0',
            fontSize: '14px',
            marginTop: '5px',
            color: '#565656d6',
            cursor: 'pointer',
          }}
        >
          답글 달기
        </Button>
      )}

      {showReplies &&
        replies.map((reply) => (
          <Box
            key={reply.id}
            sx={{
              paddingLeft: '20px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Typography sx={{ color: '#9252E7' }}>↳</Typography>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* 댓글수정시 */}
                {editingReplyId === reply.id ? (
                  <>
                    <TextField
                      value={editReplyContent}
                      onChange={(e) => setEditReplyContent(e.target.value)}
                      size='small'
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '32px',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                    <Button
                      onClick={() => handleReplyEditSubmit(reply.id)}
                      sx={{
                        border: '1px solid #9252E7',
                        fontSize: '14px',
                        margin: '0 5px',
                        padding: '0',
                        minWidth: '40px',
                        borderRadius: '10px',
                        color: '#9252E7',
                        cursor: 'pointer',
                      }}
                    >
                      완료
                    </Button>
                    <Button
                      onClick={handleReplyEditCancel}
                      sx={{
                        border: '1px solid #9252E7',
                        fontSize: '14px',
                        margin: '0 5px',
                        padding: '0',
                        minWidth: '40px',
                        borderRadius: '10px',
                        color: '#9252E7',
                        cursor: 'pointer',
                      }}
                    >
                      취소
                    </Button>
                  </>
                ) : (
                  <>
                    {/* 유저의 이름 + 댓글 내용 */}
                    <Avatar
                      src={reply?.User?.profile_picture || ''}
                      sx={{
                        width: 24,
                        height: 24,
                      }}
                    ></Avatar>
                    <Typography variant='body2' sx={{ fontWeight: 'normal' }}>
                      {reply?.User?.username || '익명'}:{' '}
                      {reply.content || reply.text}
                    </Typography>
                    {/* 대댓 수정+삭제 버튼 */}
                    {String(reply.user_id) === String(userId) && (
                      <>
                        <Button
                          onClick={() =>
                            handleReplyEdit(
                              reply.id,
                              reply.content || reply.text
                            )
                          }
                          color='primary'
                          size='small'

                        >
                          수정
                        </Button>
                        <Button
                          variant='outlined'
                          onClick={() => handleReplyDelete(reply.id)}
                          color='primary'
                          size='small'

                        >
                          삭제
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Box>
        ))}
    </Box>
  );
};

export default Comment;
