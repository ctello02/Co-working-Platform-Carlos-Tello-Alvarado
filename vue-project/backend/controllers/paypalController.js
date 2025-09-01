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

  const request = new checkout.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    if (capture.statusCode === 201) {
      const captureId =
        capture.result.purchase_units[0].payments.captures[0].id;

      // Marcar la reserva como pagada
      await Reservation.updateOne(
        { _id: reservationId },
        {
          $set: {
            paypalCaptureId: captureId,
            isPaid: true,
            paymentStatus: 'COMPLETED',
          },
        }
      );
      return res.status(201).json({
        capture: captureId,
        paymentStatus: 'COMPLETED',
      });
    }

    //Fallo
    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paymentStatus: 'FAILED' } }
    );
    res.status(400).json({ error: 'No se pudo capturar el pago' });
  } catch (err) {
    console.error(err);
    await Reservation.updateOne(
      { _id: reservationId },
      { $set: { paymentStatus: 'FAILED' } }
    );
    res.status(500).json({ error: 'Error capturando pago' });
  }
};

exports.getCaptureId = async (req, res) => {
  const { reservationId } = req.params;

  const reserva = await Reservation.findById(reservationId);
  if (!reserva) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }

  try {
    res.status(200).json({
      originalCaptureId: reserva.paypalCaptureId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo el ID de captura' });
  }
};

exports.refundPayment = async (req, res) => {
  const { reservationId, captureId } = req.body;

  if (!captureId) {
    return res.status(400).json({ error: 'No hay captura para reembolsar' });
  }

  const refundRequest = new checkout.payments.CapturesRefundRequest(captureId);
  refundRequest.requestBody({});

  try {
    const refund = await client().execute(refundRequest);

    await Reservation.updateOne(
      { _id: reservationId },
      {
        $set: {
          isPaid: true,
          paymentStatus: 'UPDATED',
        },
      }
    );

    res.status(200).json({
      refundId: refund.result.id,
      status: 'UPDATED',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reembolsar el pago' });
  }
};
