import { Request, Response } from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { User, UserAttributes } from '../../models/user';
import { Feed, FeedAttributes } from '../../models/feed';
import { Influencer, InfluencerAttributes } from '../../models/influencer';
import { MembershipProduct, MembershipProductAttributes } from '../../models/membershipProduct';
import { Membership, MembershipAttributes } from '../../models/membership';
import { Op } from 'sequelize';
import _ from "lodash";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'productImgs', maxCount: 5 },
  { name: 'postImages', maxCount: 5 },
]);

export const postCurrentLoggedInUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    //user의 id를 통해 post 조회할 예정
    const { id } = req.body;

    const user = await User.findOne({
      where: { id },
      raw: true, // 순수 데이터 객체 반환
    }) as UserAttributes | null; // 반환 타입 명시

    const influencer = await Influencer.findOne({
      where: { user_id: id },
      raw: true, // 순수 데이터 객체 반환
    }) as InfluencerAttributes | null; // 반환 타입 명시

    if (!user) {
      res.status(404).json({
        message: '현재 홈 화면에서 유효한 user 정보를 DB에서 찾는 것에 실패했습니다.',
        status: 404,
      })
    }

    res.status(200).json({ ...user, influencerId: influencer?.id }); // 응답 후 user 반환

  } catch (error) {
    console.error('FeedGet Error:', error);
    res.status(500).json({
      message: "로그인 정보를 가져오는데 문제가 생겼습니다. FeedGet Error.",
      status: 500,
      error: error,
    });
  }
};

// export const getFeeds = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const limit = parseInt(req.body.limit as string, 10) || 1; // 기본값 1(확연한 오류 정보를 보여주기 위함)
//     const offset = parseInt(req.body.offset as string, 10) || 0; // 기본값 0(확연한 오류 정보를 보여주기 위함)
//     // const followList = req.body.userFollowList as number[];
//     const userFollowList = req.body.userFollowList as number[];
//     const userId = req.body.userId as number;

//     // userFollowList를 숫자 배열로 변환
//     // const userFollowList: number[] = followList
//     //   ? followList.split(",")
//     //     .map((id) => parseInt(id, 10))
//     //     .filter((id) => !isNaN(id))
//     //   : [];

//     //visibility_level: 1인 전체공개 게시글 전부 가져오기
//     const feeds1 = await Feed.findAll({
//       limit, // 기본설정은 10개 데이터만 가져오기
//       offset, // offset의 Num값부터 시작
//       where: {
//         visibility_level: 1
//       },
//       attributes: ['id'], // name 필드만 선택
//     });

//     //visibility_level: 2인 팔로워 전용 게시글 가져오기
//     const feeds2 = await Feed.findAll({
//       limit, // 기본설정은 10개 데이터만 가져오기
//       offset, // offset의 Num값부터 시작
//       where: {
//         visibility_level: 2,
//         influencer_id: { [Op.in]: userFollowList }, // userFollowList와 일치하는 influencer_id만
//       },
//       attributes: ['id'], // name 필드만 선택
//     });

//     const userMemberships = await Membership.findAll({
//       where: { user_id: userId, status: 'active' },
//       raw: true, // 순수 데이터 객체 반환
//       attributes: ['product_id'], // name 필드만 선택
//     })

//     // 숫자 배열로 변환
//     const productIds = userMemberships.map((membership) => membership.product_id);


//     const influencerProducts = await MembershipProduct.findAll({
//       where: { id: { [Op.in]: productIds }, is_active: 1 },
//       raw: true, // 순수 데이터 객체 반환
//       attributes: ['influencer_id'], // name 필드만 선택
//     })

//     const influencerIds = influencerProducts.map((id) => id.influencer_id);

//     // console.log(influencerProducts, "    influencerProduct");

//     //visibility_level: 3인 팔로워 전용 게시글 가져오기
//     const feeds3 = await Feed.findAll({
//       limit, // 기본설정은 10개 데이터만 가져오기
//       offset, // offset의 Num값부터 시작
//       where: {
//         visibility_level: 3,
//         influencer_id: { [Op.in]: influencerIds }, // userFollowList와 일치하는 influencer_id만
//       },
//       attributes: ['id'], // name 필드만 선택
//     });

//     // const feeds = [...feeds1, ...feeds2, ...feeds3];
//     const feedIdsObj = [...feeds3, ...feeds2, ...feeds1];
//     const feedIds = feedIdsObj.map())


//     res.status(200).json(feeds); // 응답 후 user 반환

//   } catch (error) {
//     console.error('FeedGet Error:', error);
//     res.status(500).json({
//       message: "피드를 가져오는 중 오류가 발생했습니다.",
//       status: 500,
//       error: error.message,
//     });
//   }
// };

export const getFeedsQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    // const followList = req.body.userFollowList as number[];
    const userFollowList = req.body.userFollowList as number[];
    const userId = req.body.userId as number;

    // console.log(userFollowList, userId, "ggg")

    // userFollowList를 숫자 배열로 변환
    // const userFollowList: number[] = followList
    //   ? followList.split(",")
    //     .map((id) => parseInt(id, 10))
    //     .filter((id) => !isNaN(id))
    //   : [];

    //visibility_level: 1인 전체공개 게시글 전부 가져오기
    const feeds1 = await Feed.findAll({
      limit: 100,
      where: {
        visibility_level: 1
      },
      attributes: ['id'], // name 필드만 선택
      raw: true,
    }) as Pick<FeedAttributes, 'id'>[];

    let feed1Arr = feeds1.map((obj) => (obj.id))
    feed1Arr = _.shuffle(feed1Arr);

    if (!userFollowList || !userId) {
      res.status(200).json(feed1Arr); // 응답 후 user 반환
      return;
    }
    // console.log(feed1Arr, "feed1Arr");

    const userMemberships = await Membership.findAll({
      where: { user_id: userId, status: 'active' },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['product_id'], // name 필드만 선택
    })

    // 숫자 배열로 변환
    const productIds = userMemberships.map((membership) => membership.product_id);

    const influencerProducts = await MembershipProduct.findAll({
      where: { id: { [Op.in]: productIds }, is_active: 1 },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['influencer_id'], // name 필드만 선택
    })

    const influencerIds = influencerProducts.map((id) => id.influencer_id);

    // console.log(influencerProducts, "    influencerProduct");

    //visibility_level: 2인 팔로워 전용 게시글 가져오기
    const feeds2 = await Feed.findAll({
      limit: 100,
      where: {
        [Op.or]: [
          {
            // 1. visibility_level: 3이고, 팔로우한 인플루언서의 게시글
            visibility_level: 2,
            influencer_id: { [Op.in]: userFollowList }, // userFollowList와 일치하는 influencer_id만
          },
          {
            // 2. visibility_level: 2이고, 팔로우하지 않았지만 멤버십에 가입한 인플루언서의 게시글
            visibility_level: 2,
            influencer_id: {
              [Op.and]: [
                { [Op.notIn]: userFollowList }, // 팔로우하지 않은 인플루언서
                { [Op.in]: influencerIds }, // 멤버십에 가입한 인플루언서
              ],
            },
          },
        ],
      },
      attributes: ['id'], // name 필드만 선택
    }) as Pick<FeedAttributes, 'id'>[];

    let feed2Arr = feeds2.map((obj) => (obj.id))
    feed2Arr = _.shuffle(feed2Arr);
    // console.log(feed2Arr, "feed2Arr");


    //visibility_level: 3인 팔로워 전용 게시글 가져오기
    const feeds3 = await Feed.findAll({
      limit: 100,
      where: {
        // 1. visibility_level: 3이고, 팔로우한 인플루언서의 게시글
        visibility_level: 3,
        influencer_id: { [Op.in]: influencerIds }, // 팔로우한 인플루언서
      },
      attributes: ['id'], // name 필드만 선택
    }) as Pick<FeedAttributes, 'id'>[];

    let feed3Arr = feeds3.map((obj) => (obj.id))
    feed3Arr = _.shuffle(feed3Arr);

    // const feeds = [...feeds1, ...feeds2, ...feeds3];
    // const feedIds = [...feed3Arr, ...feed2Arr, ...feed1Arr].filter();
    const feedIds = [...feed3Arr, ...feed2Arr, ...feed1Arr].filter((id) => id !== undefined);

    // console.log(feedIds, "feedIds");
    res.status(200).json(feedIds); // 응답 후 user 반환

  } catch (error) {
    console.error('FeedGetQueue Error:', error);
    res.status(500).json({
      message: "피드를 가져오는 중 오류가 발생했습니다.",
      status: 500,
      error: error.message,
    });
  }
};

export const getFeeds = async (req: Request, res: Response): Promise<void> => {
  try {
    const queue = req.body.queue as number[];
    const limit = req.body.limit as number;
    console.log(queue, limit, "sadfasdf")

    const slicedQueue = queue.slice(0, limit);

    const feeds = await Feed.findAll({
      where: {
        id: { [Op.in]: slicedQueue }
      },
      raw: true,
    }) || [];

    res.status(200).json(feeds);

  } catch (error) {
    console.error('FeedGet Error:', error);
    res.status(500).json({
      message: "피드를 가져오는 중 오류가 발생했습니다.",
      status: 500,
      error: error.message,
    });
  }
};

export const postFeedDatatoInfluencerData = async (req: Request, res: Response): Promise<void> => {
  try {
    //user의 id를 통해 post 조회할 예정
    const { id } = req.body;

    const influencer = await Influencer.findOne({
      where: { id },
      raw: true, // 순수 데이터 객체 반환
    }) as InfluencerAttributes | null; // 반환 타입 명시

    res.status(200).json(influencer); // 응답 후 user 반환
  } catch (error) {
    console.error('postFeedDatatoInfluencerData Error:', error);
    res.status(500).json({
      message: "로그인 정보를 가져오는데 문제가 생겼습니다.",
      status: 500,
      error: error,
    });
  }
};


export const patchUserFollow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, influencerId, isFollowing } = req.body;

    const user = await User.findOne({
      where: { id: userId },
    }) as UserAttributes | null; // 반환 타입 명시

    if (!user) {
      res.status(404).json({
        message: "현재 로그인된 유저 정보와 일치하는 유효한 user 정보가 DB에 없습니다.",
        status: 404,
      });
      return;
    }

    // 기존 follow 배열 파싱 (JSON으로 저장된 경우 처리)
    let followList = user.follow || [];
    if (typeof followList === "string") {
      followList = JSON.parse(followList);
    }

    // follow 목록 수정
    if (isFollowing) {
      // 팔로우 추가
      if (!followList.includes(influencerId.toString())) {
        followList.push(influencerId.toString());
      }
    } else {
      // 언팔로우 제거
      followList = followList.filter((id) => id !== influencerId.toString());
    }

    // DB 업데이트
    await User.update(
      { follow: followList }, // 배열을 문자열로 변환하여 저장
      { where: { id: userId } }
    );

    res.status(200).json({
      message: `사용자 ID ${userId}의 follow 목록이 성공적으로 업데이트되었습니다.`,
      status: 200,
    });

  } catch (error) {
    console.error('patchUserFollow Error:', error);
    res.status(500).json({
      message: '유저의 Follow 배열의 값을 갱신하는데 문제가 생겼습니다.',
      status: 500,
      error: error,
    });
  }
}


export const patchFeedLikes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedId } = req.params;
    const { likes } = req.body;

    // DB 업데이트
    await Feed.update(
      { likes: JSON.stringify(likes) }, // likes 배열을 JSON 문자열로 저장
      { where: { id: feedId } }
    );

    res.status(200).json({
      message: `피드 ${feedId}의 좋아요 목록이 성공적으로 업데이트되었습니다. likes: ${likes}`,
      status: 200,
    });

  } catch (error) {
    console.error("서버에서 좋아요 데이터를 업데이트하는 중 오류 발생:", error);
    res.status(500).json({
      message: '서버에서 좋아요 데이터를 업데이트하는 중 오류가 발생했습니다.',
      status: 500,
      error: error,
    });
  }
};

export const postInfluencerUsernameInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { influencerId } = req.body;

    const influencer = await Influencer.findOne({
      where: { id: influencerId },
      raw: true, // 순수 데이터 객체 반환
    }) as InfluencerAttributes | null; // 반환 타입 명시

    if (!influencer || !influencer.user_id) {
      res.status(404).json({
        message: "피드의 아이디를 통해 인플루언서를 찾을 수 없습니다.",
        status: 404,
      });
    }

    const user = await User.findOne({
      where: { id: influencer?.user_id },
      raw: true, // 순수 데이터 객체 반환
    }) as InfluencerAttributes | null; // 반환 타입 명시

    if (!user) {
      res.status(404).json({
        message: "피드의 아이디를 통해 인플루언서를 찾았으나 유효한 유저가 아닙니다.",
        status: 404,
      })
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("피드에서 인플루언서 id를 참고하여 user 테이블의 username을 가져오는 과정에서 문제가 생겼습니다: ", error);
    res.status(500).json({
      message: "피드에서 인플루언서 id를 참고하여 user 테이블의 username을 가져오는 과정에서 문제가 생겼습니다.",
      status: 500,
      error: error,
    });
  }
}

export const postUserIdByInfluencerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { influencerId } = req.body;

    const influencer = await Influencer.findOne({
      where: { id: influencerId },
      raw: true, // 순수 데이터 객체 반환
    }) as InfluencerAttributes | null; // 반환 타입 명시

    if (!influencer || !influencer.user_id) {
      res.status(404).json({
        message: "피드의 아이디를 통해 인플루언서를 찾을 수 없습니다",
        status: 404,
      })
    }

    res.status(200).json(influencer);

  } catch (error) {
    console.error("postUserIdByInfluencerId ", error);
    res.status(500).json({
      message: "postUserIdByInfluencerId",
      status: 500,
      error: error,
    });
  }
}

export const postUsernameByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({
      where: { id: userId },
      raw: true, // 순수 데이터 객체 반환
    }) as UserAttributes | null; // 반환 타입 명시

    if (!user) {
      res.status(404).json({
        message: "피드의 아이디를 통해 인플루언서를 찾았으나 유효한 유저가 아닙니다.",
        status: 404,
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("postUsernameByUserId ", error);
    res.status(500).json({
      message: "postUsernameByUserId",
      status: 500,
      error: error,
    });
  }
}


export const getMembershipProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const visibilityLevel = parseInt(req.query.visibilityLevel as string, 10);
    const influencerId = parseInt(req.query.influencerId as string, 10);

    // console.log(influencerId, typeof influencerId, visibilityLevel, typeof visibilityLevel);

    const membershipProduct = await MembershipProduct.findOne({
      where: { influencer_id: influencerId, level: visibilityLevel, is_active: 1 },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['name'], // name 필드만 선택
    }) as Pick<MembershipProductAttributes, 'name'> | null; // 반환 타입 명시

    if (!membershipProduct) {
      res.status(204).json("unknown");
      return;
    }

    res.status(200).json(membershipProduct);

  } catch (error) {
    console.error("getMembershipProduct ", error.message);
    res.status(500).json({
      message: "getMembershipProduct",
      status: 500,
      error: error.message,
    });
  }
}

export const getUserMembershipLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.query.visibilityLevel as string, 10);
    const influencerId = parseInt(req.query.influencerId as string, 10);

    const product = await Membership.findOne({
      where: { user_id: userId, status: 'active' },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['id'], // name 필드만 선택
    }) as Pick<MembershipAttributes, 'id'> | null; // 반환 타입 명시

    if (!product) {
      res.status(204).json({ level: 0 });
      return;
    }

    const userMembership = await MembershipProduct.findOne({
      where: { id: product.id, is_active: 1 },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['level'], // name 필드만 선택
    }) as Pick<MembershipProductAttributes, 'level'> | null; // 반환 타입 명시

    if (!userMembership) {
      res.status(204).json({ level: 0 });
      return;
    }

    res.status(200).json({ level: userMembership.level });

  } catch (error) {
    console.error("getUserMembershipLevel ", error.message);
    res.status(500).json({
      message: "getUserMembershipLevel",
      status: 500,
      error: error.message,
    });
  }
}


export const getMembershipProductsFromInfluencerId = async (req: Request, res: Response): Promise<void> => {
  try {
    const influencerId = parseInt(req.query.influencerId as string, 10);

    const influencerProducts = await MembershipProduct.findAll({
      where: { influencer_id: influencerId, is_active: 1 },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['id'], // name 필드만 선택
    })
    // console.log(influencerProducts, "    influencerProduct");

    if (!influencerProducts || influencerProducts.length === 0) {
      res.status(204).json({
        message: "getUserMembershipLevel not found",
        status: 204,
      });
      return;
    }

    res.status(200).json(influencerProducts);
  } catch (error) {
    console.error("getMembershipProductsFromInfluencerId ", error.message);
    res.status(500).json({
      message: "getUserMembershipLevel",
      status: 500,
      error: error.message,
    });
  }
}

export const getMembershipFromUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.body.userId as string, 10);

    const userMembership = await Membership.findAll({
      where: { user_id: userId, status: 'active' },
      raw: true, // 순수 데이터 객체 반환
      attributes: ['product_id'], // name 필드만 선택
    })
    // console.log(userMembership, "    userMembership");
    if (!userMembership || userMembership.length === 0) {
      res.status(204).json({
        message: "getMembershipFromUserId not found",
        status: 204,
      });
      return;
    }

    res.status(200).json(userMembership);
  } catch (error) {
    console.error("getMembershipFromUserId ", error.message);
    res.status(500).json({
      message: "getMembershipFromUserId",
      status: 500,
      error: error.message,
    });
  }
}


