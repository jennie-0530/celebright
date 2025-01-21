// read-only
import confirmPayment from '../services/paymentsService';

async function confirmPaymentController(req, res, next) {
  const confirmResponse = await confirmPayment(req.body);

  return res.json({ data: confirmResponse });
}

export default confirmPaymentController;