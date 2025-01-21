import { Request, Response } from 'express';
import { db } from '../models';
import { Op } from 'sequelize';

// 오늘 날짜의 시작과 끝을 구하는 함수
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// 오늘 가입자 수 조회
export const getTodayUserCount = async (req: Request, res: Response) => {
  try {
    const { start, end } = getTodayRange();

    const count = await db.User.count({
      where: {
        created_at: {
          [Op.between]: [start, end],
        },
      },
    });

    res.json({ todayUserCount: count });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
};

// 총 가입자 수 조회
export const getTotalUserCount = async (req: Request, res: Response) => {
  try {
    const count = await db.User.count();
    res.json({ totalUserCount: count });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
};

// 피드 글 갯수 조회
export const getFeedCount = async (req: Request, res: Response) => {
  try {
    const count = await db.Feed.count();
    res.json({ feedCount: count });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
};

// 모든 통계 한 번에 조회
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { start, end } = getTodayRange();

    const [
      todayUserCount,
      totalUserCount,
      feedCount,
      influencerCount,
      todayFeedCount,
    ] = await Promise.all([
      db.User.count({
        where: {
          created_at: {
            [Op.between]: [start.toISOString(), end.toISOString()],
          },
        },
      }),
      db.User.count(),
      db.Feed.count(),
      db.Influencer.count(),
      db.Feed.count({
        where: {
          created_at: {
            [Op.between]: [start.toISOString(), end.toISOString()],
          },
        },
      }),
    ]);

    res.json({
      todayUserCount,
      totalUserCount,
      feedCount,
      influencerCount,
      todayFeedCount, // 응답에 오늘 작성된 피드 수 추가
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
};
