import axios from "axios";
import { CurrentLoggedInUser, Feed, FeedPrototype, FollowingStatus, LikeStatus } from "../../types/homeFeedType";
import { processFeeds } from "../../util/homeFeedApi";
import { useEffect, useState } from "react";
import { useFollow } from "./useFollowingStatus";
import { useLike } from "./useLike";
import { useLoggedInUserStore } from "../../store/authStore";

// export const useFetchFeeds = (loggedInUser: CurrentLoggedInUser | null, likeStatus: LikeStatus) => {
// export const useFetchFeeds = (loggedInUser: CurrentLoggedInUser | null) => {
export const useFetchFeeds = () => {
  const loggedInUser = useLoggedInUserStore((state) => state.loggedInUser);
  const [feeds, setFeeds] = useState<Feed[]>([]); //홈에 표시되는 피드들
  const [hasMore, setHasMore] = useState(true); //홈에 표시되는 피드들이 더 있는지 확인하는 부울값
  const [offset, setOffset] = useState(0); //DB에서 불러온 피드 데이터가 저장된 Queue에 몇 번째부터 불러올지 정하는 숫자
  const [queue, setQueue] = useState<number[]>([])
  const { likeStatus, handleLikeClick } = useLike(feeds);
  const limit = 10;
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeeds = async () => {
    const response = await axios.post("http://localhost:4000/homefeed/getfeeds", { queue, limit });

    const newFeedsPrototype: FeedPrototype[] = response.data;

    // 함수의 형태를 구성하는 순수함수 호출
    const processedFeeds = await processFeeds(newFeedsPrototype, loggedInUser);
    const newHasMore = processedFeeds.length <= limit ? true : false;

    return { processedFeeds, newHasMore }
  }

  //로그인 상태 개선 되면 바로 피드 정보 업데이트
  useEffect(() => {
    const initFeeds = async () => {
      const userFollowList = loggedInUser ? loggedInUser.follow : [];
      const userId = loggedInUser ? loggedInUser.userId : null;
      // console.log(userFollowList, userId, "sdfasdfd");
      const response = await axios.post("http://localhost:4000/homefeed/getFeedsQueue", { userFollowList: userFollowList, userId: userId });
      const initQueue = response.data as number[];
      setQueue(initQueue);
    }
    initFeeds();
  }, [loggedInUser?.userId]);

  //로그인 상태 개선 되면 바로 피드 정보 업데이트
  useEffect(() => {
    fetchFeeds();
  }, [loggedInUser]);

  //로그인 상태 개선 되면 바로 피드 정보 업데이트
  useEffect(() => {
    const feedsChanged = async () => {
      const { processedFeeds, newHasMore } = await fetchFeeds();
      setFeeds([...feeds, ...processedFeeds]);
      setHasMore(newHasMore)
    }
    feedsChanged();
  }, [queue.length]);


  //feed 10개씩 계속 갱신하기
  const fetchMoreFeeds = async () => {
    if (isLoading || !hasMore) return; // 중복 요청 방지
    setIsLoading(true); // 로딩 시작

    try {
      const newQueue = queue.slice(limit, queue.length);
      setQueue(newQueue);
    } catch (error) {
      console.error("Error fetching more feeds:", error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
    // if (hasMore) await fetchFeeds(); // 데이터 추가 요청
  }

  useEffect(() => {
    setFeeds((prevFeeds) =>
      prevFeeds.map((feed) => {
        if (likeStatus[feed.id] !== undefined) {
          const isLiked = likeStatus[feed.id];

          // 좋아요 추가/제거 로직
          const updatedLikes = isLiked
            ? feed.likes.includes(loggedInUser!.userId) // 중복 체크
              ? feed.likes // 이미 존재하면 그대로 유지
              : [...feed.likes, loggedInUser!.userId] // 좋아요 추가
            : feed.likes.filter((id) => id !== loggedInUser?.userId); // 좋아요 제거

          return {
            ...feed,
            likes: updatedLikes,
          };
        }
        return feed;
      })
    );
  }, [likeStatus]);


  return { feeds, hasMore, fetchMoreFeeds, isLoading, likeStatus, handleLikeClick }
}