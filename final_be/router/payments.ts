import express from "express";
import confirmPaymentController  from "../controllers/paymentController";


const router = express.Router();

// 결제 확인
router.post("/confirm", confirmPaymentController);

export { router };
