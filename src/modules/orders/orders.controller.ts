import { Constants, stripe } from "@configs";
import {
  CartsEntity,
  OrderEntity,
  OrderItemsEntity,
  ProductsEntity,
} from "@entities";
import { finalPrice, getRepo } from "@helpers";
import { PaymentMode, Status, TRequest, TResponse } from "@types";
import { CartItemsEntity } from "db/entities/cart-items.entity";
import { NextFunction } from "express";
import Stripe from "stripe";
import { OrderDTO } from "./dtos";
import { getDB } from "@db";

export async function checkout(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;

    const parsed = OrderDTO.parse(req.body);

    const { isSingle, productId, address, city, state, pincode, paymentMode } = parsed;

    const productRepo = getRepo(ProductsEntity);
    const orderItemsRepo = getRepo(OrderItemsEntity);
    const cartsRepo = getRepo(CartsEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);
    const ordersRepo = getRepo(OrderEntity);

    if (isSingle) {
      if (!productId) {
        return res.status(400).json({ message: "productId is required" });
      }
      const product = await productRepo.findOne({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const totalAmount = Number(product.price);

      if (totalAmount < Constants.MINIMUM_ORDER_AMOUNT) {
        return res
          .status(400)
          .json({ message: "Product amount should be 50 for single product" });
      }

      if (paymentMode === PaymentMode.COD) {
        const order = ordersRepo.create({
          user_id: id,
          total_amount: totalAmount,
          delivery_address: address,
          city,
          state,
          pincode,
          payment_mode: paymentMode,
        });

        await ordersRepo.save(order);

        const orderItem = orderItemsRepo.create({
          order_id: order.id,
          product_id: productId,
          price: totalAmount,
        });

        await orderItemsRepo.save(orderItem);

        return res.status(200).json({ message: "Order placed", order: order });
      }

      const final_price = Math.round(finalPrice(product.price, product.discount) * 100) / 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(final_price * 100),
        currency: "inr",
        metadata: {
          userId: id.toString(),
          productId: productId?.toString() || "",
          isSingle: isSingle ? "true" : "false",
          address,
          city,
          state,
          pincode,
        },
      });

      return res.status(200).json({
        client_secret: paymentIntent.client_secret,
      });
    } else {
      const cart = await cartsRepo.findOne({
        where: { user_id: id },
      });

      if (!cart) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const cartItems = await cartItemsRepo.find({
        where: { cart_id: cart.id },
        relations: {
          product: true,
        },
      });

      if (!cartItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const totalAmount = cartItems.reduce((sum, item) => {
        const final_price = Math.round(finalPrice(item.product.price, item.product.discount) * 100) / 100;

        return sum + final_price * item.quantity;
      }, 0);

      if (totalAmount < Constants.MINIMUM_ORDER_AMOUNT) {
        return res.status(400).json({
          message: `Minimum order amount must be ₹${Constants.MINIMUM_ORDER_AMOUNT} to proceed with payment.`,
        });
      }

      if (paymentMode === PaymentMode.COD) {
        const order = ordersRepo.create({
          user_id: id,
          total_amount: totalAmount,
          delivery_address: address,
          city,
          pincode,
          state,
          payment_mode: paymentMode,
        });

        await ordersRepo.save(order);

        const orderItems = cartItems.map((item) => {
          const final_price =
            Math.round(
              finalPrice(item.product.price, item.product.discount) * 100,
            ) / 100;
          return orderItemsRepo.create({
            order_id: order.id,
            product_id: item.product_id,
            price: final_price,
            quantity: item.quantity,
          });
        });

        await orderItemsRepo.save(orderItems);
        await cartItemsRepo.delete({
          cart_id: cart.id,
        });
        return res.status(200).json({ message: "Order placed", order: order });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "inr",
        metadata: {
          userId: id.toString(),
          productId: productId?.toString() || "",
          cartId: cart?.id?.toString() || "",
          isSingle: isSingle ? "true" : "false",
          address,
          city,
          state,
          pincode,
        },
      });

      return res.status(200).json({
        client_secret: paymentIntent.client_secret,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function stripeWebHook(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const {
          userId,
          productId,
          cartId,
          isSingle,
          address,
          city,
          state,
          pincode,
        } = paymentIntent.metadata;

        const stripePaymentId = paymentIntent.id;

        if (!address || !city || !pincode || !state) {
          throw new Error("Invalid metadata");
        }

        if (!userId) break;
        const db = getDB();
        const orderRepo = db.getRepository(OrderEntity);

        const existingOrder = await orderRepo.findOne({
          where: { stripe_session_id: stripePaymentId },
        });

        if (existingOrder) {
          console.log("Order already processed");
          return res.status(200).json({ received: true });
        }

        await db.transaction(async (manager) => {
          const orderRepo = manager.getRepository(OrderEntity);
          const orderItemsRepo = manager.getRepository(OrderItemsEntity);
          const cartItemsRepo = manager.getRepository(CartItemsEntity);
          const productRepo = manager.getRepository(ProductsEntity);

          let totalAmount = 0;
          let orderItems: OrderItemsEntity[] = [];

          if (isSingle === "true") {
            if (!productId) {
              throw new Error("Invalid productId");
            }
            const product = await productRepo.findOne({
              where: { id: Number(productId) },
            });

            if (!product) throw new Error("Product not found");

            const final_price =
              Math.round(finalPrice(product.price, product.discount) * 100) /
              100;

            totalAmount = final_price;

            orderItems.push(
              orderItemsRepo.create({
                product_id: product.id,
                price: final_price,
                quantity: 1,
              }),
            );
          } else {
            if (isSingle === "false" && !cartId) {
              throw new Error("Invalid cartId");
            }
            const cartItems = await cartItemsRepo.find({
              where: { cart_id: Number(cartId) },
              relations: { product: true },
            });

            if (!cartItems.length) throw new Error("Cart empty");

            totalAmount = cartItems.reduce((sum, item) => {
              const final_price =
                Math.round(
                  finalPrice(item.product.price, item.product.discount) * 100,
                ) / 100;

              return sum + final_price * item.quantity;
            }, 0);

            orderItems = cartItems.map((item) => {
              const final_price =
                Math.round(
                  finalPrice(item.product.price, item.product.discount) * 100,
                ) / 100;

              return orderItemsRepo.create({
                product_id: item.product_id,
                price: final_price,
                quantity: item.quantity,
              });
            });

            await cartItemsRepo.delete({ cart_id: Number(cartId) });
          }

          const order = orderRepo.create({
            user_id: Number(userId),
            total_amount: totalAmount,
            delivery_address: address,
            city,
            state,
            pincode,
            payment_mode: PaymentMode.ONLINE,
            status: Status.PAID,
            stripe_session_id: paymentIntent.id,
          });

          await orderRepo.save(order);

          const itemsWithOrder = orderItems.map((item) => {
            item.order_id = order.id;
            return item;
          });

          await orderItemsRepo.save(itemsWithOrder);
        });

        console.log("Order created after payment success");

        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const orderRepo = getRepo(OrderEntity);

    const orders = await orderRepo.find({
      where: { user_id: id },
      relations: {
        items: {
          product: true,
        },
      },
      order: {
        id: "DESC"
      },
    });

    if (orders.length === 0) {
      return res.status(200).json({ message: "No orders yet" });
    }

    return res
      .status(200)
      .json({ message: "Orders fetched successfully", orders: orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const orderId = Number(req.params.orderId);

    const ordersRepo = getRepo(OrderEntity);

    const order = await ordersRepo.findOne({
      where: { id: orderId, user_id: id },
      relations: {
        items: true,
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Order does not exist" });
    }
    return res
      .status(200)
      .json({ message: "Order fetched successfully", order: order });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const orderId = Number(req.params.orderId);

    const orderRepo = getRepo(OrderEntity);

    const order = await orderRepo.findOne({
      where: { id: orderId, user_id: id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order does not exist" });
    }

    order.status = Status.CANCELLED;

    await orderRepo.save(order);

    return res
      .status(200)
      .json({ message: "Order cancelled", cancelledOrder: order });
  } catch (error) {
    next(error);
  }
}