import amqp from "amqplib";
import dotenv from "dotenv";
import { getFollowersByInfluencerId, saveNotification } from "./notificationService";
import { getSocketInstance } from "../util/socket_be";
import { userSocketMap } from "../util/socketState";
import { getUserByInfluencerId } from "./userService";

dotenv.config();

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
let isInitialized = false;

// RabbitMQ 컨슈머 초기화
export const startConsumer = async (): Promise<void> => {
  if (isInitialized) {
    console.log("RabbitMQ consumer is already initialized.");
    return;
  }

  try {
    console.log("Connecting to RabbitMQ...");
    connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672");
    console.log("Connected to RabbitMQ.");

    console.log("Creating channel...");
    channel = await connection.createChannel();
    console.log("Channel created.");

    const queue = process.env.RABBITMQ_QUEUE || "notification";
    console.log(`Asserting queue: ${queue}`);
    await channel.assertQueue(queue, { durable: true });
    console.log("Queue asserted.");

    // QoS 설정: 한 번에 하나의 메시지 처리
    await channel.prefetch(1);

    console.log("RabbitMQ consumer started, waiting for messages...");
    channel.consume(queue, async (msg) => {
      if (channel && msg) {
        try {
          console.log("컨슈머: 메시지 수신.", msg.content.toString());
          await handleNotificationMessage(msg);
          channel.ack(msg); // 메시지 처리 성공
        } catch (error) {
          console.error("Failed to process message:", error);
          channel.nack(msg, false, false); // 메시지 처리 실패
        }
      }
    });

    isInitialized = true;
  } catch (error) {
    console.error("RabbitMQ consumer initialization failed:", error);
  }
};

// 메시지 처리
const handleNotificationMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
  try {
    const { feedId, influencerId, message } = JSON.parse(msg.content.toString());
    console.log("Received message from RabbitMQ:", { feedId, influencerId, message });

    const followers = await getFollowersByInfluencerId(influencerId);
    console.log("Followers fetched:", followers);

    await saveNotifications(followers, feedId);
    await sendNotifications(followers, influencerId, feedId);

    console.log("컨슈머: 메시지 처리 완료.", { feedId, influencerId, message });
  } catch (error) {
    console.error("Failed to process message:", error);
    throw error; // 재처리 또는 DLQ에 의존하는 시스템의 경우 필요
  }
};

// 알림 저장
const saveNotifications = async (followers: number[], feedId: number): Promise<void> => {
  try {
    await saveNotification(followers, feedId);
    console.log(`${followers.length} notifications successfully saved.`);
  } catch (error) {
    console.error("Failed to save notifications:", error);
  }
};

// 알림 전송
const sendNotifications = async (followers: number[], influencerId: number, feedId: number): Promise<void> => {
  const io = getSocketInstance();
  console.log(`userSocketMap(전송 전): ${JSON.stringify([...userSocketMap])}`);
  if (!io) {
    console.error("Socket.IO instance not found.");
    return;
  }

  const influencer = await getUserByInfluencerId(influencerId);
  const influencerName = (influencer as { username: string }).username || "Unknown";

  const connectedFollowers = followers.filter((followerId) => userSocketMap.has(followerId));
  console.log(`Connected followers: ${connectedFollowers.length}/${followers.length}`);

  connectedFollowers.forEach((followerId) => {
    const socketId = userSocketMap.get(followerId);
    if (socketId) {
      io.to(socketId).emit("new_notification", {
        feedId,
        influencerId,
        influencerName,
        message: `Post ${feedId} by ${influencerName}`,
      });
      console.log(`Notification sent to follower ${followerId}, feed ${feedId}`);
    }
  });
};

// RabbitMQ 연결 종료
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
      console.log("RabbitMQ channel closed.");
    }
    if (connection) {
      await connection.close();
      console.log("RabbitMQ connection closed.");
    }
  } catch (error) {
    console.error("Failed to close RabbitMQ connection:", error);
  }
};
