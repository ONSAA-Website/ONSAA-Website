import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "ONSAA donations server is running." });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isInteger(amount) || amount < 100) {
      return res.status(400).json({
        error: "Donation amount must be at least 1.00 CAD."
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "cad",
      automatic_payment_methods: {
        enabled: true
      },
      // exclude all pay-later methods
      excluded_payment_method_types: [
        "affirm",
        "afterpay_clearpay",
        "alma",
        "billie",
        "klarna",
        "scalapay",
        "zip"
      ]
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Unable to create payment intent."
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`ONSAA donations server listening on port ${port}`);
});

app.get("/status", (_req, res) => {
  res.sendStatus(200);
});