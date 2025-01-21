import { Request, Response } from 'express';
import { Comment } from '../models/comment';
import { User } from '../models/user';
import sequelize from '../util/database';

export const postComment = async (req: any, res: any) => {
  try {
    const { user_id, post_id, parent_comment_id, content } = req.body;

    // 필수 필드 검증
    if (!user_id || !post_id || !content) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.',
      });
    }
    await Comment.create({
      user_id,
      post_id,
      parent_comment_id: parent_comment_id || null,
      content,
      hidden_yn: false,
    });

    return res.status(200).json({
      success: true,
      message: '댓글 달렸습니다',
    });
  } catch (error) {
    console.error('댓글 생성 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const getComment = async (req: any, res: any) => {
  try {
    const post_id = req.params.id; // 쿼리 파라미터로 post_id 받기

    // post_id가 없으면 오류 반환
    if (!post_id) {
      return res.status(400).json({
        success: false,
        message: '게시물 ID가 필요합니다.',
      });
    }

    // 주어진 post_id에 해당하는 댓글들 조회
    const comments = await Comment.findAll({
      where: {
        post_id: post_id,
        parent_comment_id: null, // 부모 댓글만 먼저 불러오기
        hidden_yn: false,
      },
      include: {
        model: User,
        attributes: ['username', 'profile_picture'], // 필요한 필드만 가져오기 (username)
      },
      order: [['created_at', 'ASC']], // 작성일 순으로 정렬
    });

    // 댓글에 하위 댓글 포함하기
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        try {
          // 부모 댓글에 대한 하위 댓글 조회
          const replies = await Comment.findAll({
            where: {
              post_id: post_id,
              parent_comment_id: comment.dataValues.id, // 부모 댓글의 ID로 하위 댓글을 찾기
              hidden_yn: false, // 숨겨진 댓글은 제외
            },
            include: {
              model: User,
              attributes: ['username', 'profile_picture'], // 작성자 정보만 가져오기
            },
            order: [['created_at', 'ASC']], // 하위 댓글도 작성일 순으로 정렬
          });

          // console.log(
          //   `Found Replies for Comment ${comment.id}: ${replies.length}`
          // ); // 하위 댓글이 제대로 조회되는지 확인

          // 부모 댓글에 하위 댓글을 'replies'라는 키로 포함
          return {
            ...comment.dataValues,
            user: comment.user?.dataValues || null, // 작성자 정보
            replies: replies.map((reply) => ({
              ...reply.dataValues,
              user: reply.user?.dataValues, // 작성자 정보
            })),
          };
        } catch (replyError) {
          console.error(
            `Error fetching replies for comment ${comment.id}:`,
            replyError
          );
          return {
            ...comment.dataValues,
            user: comment.user?.dataValues || null,
            replies: [], // 오류가 나면 빈 배열로 처리
          };
        }
      })
    );

    // 댓글이 없으면 빈 배열로 응답
    if (!comments || comments.length === 0) {
      return res.status(200).json({
        success: true,
        message: '댓글이 없습니다.',
        data: [],
      });
    }
    console.log(' 완료값 ', commentsWithReplies);

    // 댓글 조회 성공
    return res.status(200).json({
      success: true,
      data: commentsWithReplies,
    });
  } catch (error) {
    console.error('댓글 조회 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // 댓글 ID 가져오기
    console.log('delete: ', id);
    const comment = await Comment.findByPk(id);
    if (!comment) {
      res
        .status(404)
        .json({ success: false, message: '댓글을 찾을 수 없습니다.' });
    }
    if (comment) {
      // 숨김 처리 (소프트 삭제)
      await comment.update({ hidden_yn: 1 });
      res
        .status(200)
        .json({ success: true, message: '댓글이 삭제되었습니다.' });
    }
  } catch (error) {
    console.error('댓글 삭제 중 오류 발생:', error);
    res
      .status(500)
      .json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.',
      });
    }
    if (comment) {
      await comment.update({ content });

      res.status(200).json({
        success: true,
        message: '댓글이 수정되었습니다.',
        data: comment,
      });
    }
  } catch (error) {
    console.error('댓글 수정 중 오류 발생:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};
