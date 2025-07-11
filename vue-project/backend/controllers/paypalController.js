const Reservation = require('../models/reservation');
const PeriodicReservation = require('../models/periodicReservation');
const mongoose = require('mongoose');
const { client } = require('../utils/paypalClient');
const checkout = require('@paypal/checkout-server-sdk');

exports.createOrder = async (req, res) => {
  const { total, reservationId } = req.body;
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

  try {
    const order = await client().execute(request);

    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paypalOrderId: order.result.id, paymentStatus: 'CREATED' } }
    );

    res.status(201).json({
      orderID: order.result.id,
      paymentStatus: 'CREATED',
      message: 'Orden creada',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando orden' });
  }
};

exports.captureOrder = async (req, res) => {
  const { orderID, reservationId } = req.body;

  //const session = await mongoose.startSession();
  //session.startTransaction();

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
      return res.status(201).json({ capture: capture.result });
    }
    res.status(400).json({ error: 'No se pudo capturar el pago' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error capturando pago' });
  }
};
