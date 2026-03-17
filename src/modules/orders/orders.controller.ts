import { Constants, stripe } from "@configs";
import { CartsEntity, OrderEntity, OrderItemsEntity } from "@entities";
import { getRepo } from "@helpers";
import { Status, TRequest, TResponse } from "@types";
import { CartItemsEntity } from "db/entities/cart-items.entity";
import { NextFunction } from "express";
import Stripe from "stripe";

export async function checkout(
  req: TRequest,
  res: TResponse,
  next: NextFunction
) {
  try {
    const { id } = req.me;

    const cartsRepo = getRepo(CartsEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);
    const ordersRepo = getRepo(OrderEntity);
    const orderItemsRepo = getRepo(OrderItemsEntity);

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
      return sum + item.product.price * item.quantity;
    }, 0);

    if(totalAmount< Constants.MINIMUM_ORDER_AMOUNT){
      return res.status(400).json({message: `Minimum order amount must be ₹${Constants.MINIMUM_ORDER_AMOUNT} to proceed with payment.`})
    }

    const order = ordersRepo.create({
      user_id: id,
      total_amount: totalAmount,
    });

    await ordersRepo.save(order);

    const orderItems = cartItems.map((item) =>
      orderItemsRepo.create({
        order_id: order.id,
        product_id: item.product_id,
        price: item.product.price,
        quantity: item.quantity,
      })
    );

    await orderItemsRepo.save(orderItems);

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",

      success_url: `${process.env.FRONTEND_URL}/success?orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,

      metadata: {
        orderId: order.id.toString(),
        cartId:cart.id.toString()
      },
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (error) {
    next(error);
  }
}

export async function stripeWebHook(
  req: TRequest,
  res: TResponse,
  next: NextFunction
) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const ordersRepo = getRepo(OrderEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);

    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const orderId = session.metadata?.orderId;
        const cartId = session.metadata?.cartId

        if (!orderId) {
          return res.status(400).json({ message: "OrderId missing in metadata" });
        }

        const order = await ordersRepo.findOne({
          where: { id: Number(orderId) }
        });

        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }

        order.status = Status.PAID;

        await ordersRepo.save(order);

        await cartItemsRepo.delete({
          cart_id: Number(cartId),
        });

        console.log(`Order ${order.id} marked as PAID`);

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        const orderId = session.metadata?.orderId;

        if (!orderId) break;

        const order = await ordersRepo.findOne({
          where: { id: Number(orderId) }
        });

        if (!order) break;

        order.status = Status.CANCELLED;

        await ordersRepo.save(order);

        console.log(`Order ${order.id} cancelled`);

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

export async function getOrders(req:TRequest,res:TResponse,next:NextFunction){
    try {
        const {id} = req.me;
        const orderRepo = getRepo(OrderEntity);

        const orders = await orderRepo.find({
            where:{user_id:id},
            relations:{
               items:true 
            }
        })

        if(orders.length === 0){
            return res.status(200).json({message:'No orders yet'})
        }

        return res.status(200).json({message:'Orders fetched successfully', orders:orders})
    } catch (error) {
        next(error)
    }
}

export async function getOrder(req:TRequest,res:TResponse,next:NextFunction){
    try {
        const{id} = req.me
        const orderId = Number(req.params.orderId);

        const ordersRepo = getRepo(OrderEntity);

        const order = await ordersRepo.findOne({
            where:{id:orderId,user_id:id},
            relations:{
                items:true
            }
        });
        if(!order){
            return res.status(404).json({message:"Order does not exist"})
        }
        return res.status(200).json({message:'Order fetched successfully',order:order})
    } catch (error) {
        next(error)
    }
}

export async function cancelOrder(req:TRequest,res:TResponse,next:NextFunction){
  try {
    const {id} = req.me;
    const orderId = Number(req.params.orderId);

    const orderRepo = getRepo(OrderEntity);

    const order = await orderRepo.findOne({
      where:{id:orderId,user_id:id}
    })

    if(!order){
      return res.status(404).json({message:'Order does not exist'})
    }

    order.status = Status.CANCELLED;

    await orderRepo.save(order);

    return res.status(200).json({message:'Order cancelled',cancelledOrder:order})
  } catch (error) {
    next(error)
  }
}