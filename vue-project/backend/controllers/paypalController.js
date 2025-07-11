const Reservation = require('../models/reservation');
const { client } = require('../utils/paypalClient');
const checkout = require('@paypal/checkout-server-sdk');

exports.createOrder = async (req, res) => {
  let { total, reservationId } = req.body;

  total = parseFloat(total);

  const request = new checkout.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: reservationId,
        amount: {
          currency_code: 'EUR',
          value: total.toFixed(2),
        },
      },
    ],
  });

  let orderId = null;
  try {
    const order = await client().execute(request);
    orderId = order.result.id;

    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paypalOrderId: orderId, paymentStatus: 'CREATED' } }
    );

    res.status(201).json({
      orderID: orderId,
      paymentStatus: 'CREATED',
    });
  } catch (err) {
    console.error(err);
    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paypalOrderId: orderId, paymentStatus: 'FAILED' } }
    );
    res.status(500).json({ error: 'Error creando orden' });
  }
};

exports.captureOrder = async (req, res) => {
  const { orderID, reservationId } = req.body;

  console.log(req.body);

  const request = new checkout.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    if (capture.statusCode === 201) {
      // Marcar la reserva como pagada
      await Reservation.updateOne(
        { _id: reservationId },
        { $set: { isPaid: true, paymentStatus: 'COMPLETED' } }
      );
      return res.status(201).json({
        capture: capture.result,
        paymentStatus: 'COMPLETED',
      });
    }
    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paypalOrderId: orderID, paymentStatus: 'FAILED' } }
    );
    res.status(400).json({ error: 'No se pudo capturar el pago' });
  } catch (err) {
    console.error(err);
    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paypalOrderId: orderID, paymentStatus: 'FAILED' } }
    );
    res.status(500).json({ error: 'Error capturando pago' });
  }
};
