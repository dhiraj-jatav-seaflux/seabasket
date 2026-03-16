import {
  CartsEntity,
  CategoriesEntity,
  ProductsEntity,
} from "@entities";
import { getRepo } from "@helpers";
import { TRequest, TResponse } from "@types";
import { CartItemsEntity } from "db/entities/cart-items.entity";
import { NextFunction } from "express";

export async function getProducts(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productsRepo = getRepo(ProductsEntity);

    const { page, limit } = req.pager;

    const skip = (page - 1) * limit;

    const {
      name,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      categoryId,
      sortBy,
      order,
      isTrending,
    } = req.query;

    const query = productsRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.images", "images");

    if (name?.toString().trim()) {
      query.andWhere("product.name LIKE :name", {
        name: `%${name.toString().trim()}%`,
      });
    }

    if (isTrending) {
      query.andWhere("product.is_trending = :isTrending", { isTrending });
    }

    if (minPrice) {
      query.andWhere("product.price >= :minPrice", { minPrice });
    }

    if (maxPrice) {
      query.andWhere("product.price <= :maxPrice", { maxPrice });
    }

    if (minRating) {
      query.andWhere("product.rating >= :minRating", { minRating });
    }

    if (minDiscount) {
      query.andWhere("product.discount >= :minDiscount", { minDiscount });
    }

    if (categoryId) {
      query.andWhere("product.category_id = :categoryId", { categoryId });
    }

    if (sortBy) {
      query.orderBy(`product.${sortBy}`, order === "DESC" ? "DESC" : "ASC");
    }

    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();

    res.status(200).json({
      message: "Products fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const productRepo = getRepo(ProductsEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
      relations: {
        category: true,
        images: true,
        reviews: true,
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }
    res
      .status(200)
      .json({ message: "Product fetched successfully", product: product });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const categoriesRepo = getRepo(CategoriesEntity);
    const categories = await categoriesRepo.find();
    res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);

    const cartRepo = getRepo(CartsEntity);
    const productsRepo = getRepo(ProductsEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);

    const product = await productsRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        message: "Product out of stock",
      });
    }

    const userCart = await cartRepo.findOne({
      where: { user_id: id },
    });

    if (userCart) {
      const existingCartItem = await cartItemsRepo.findOne({
        where: {
          cart_id: userCart.id,
          product_id: productId,
        },
      });

      if (existingCartItem && existingCartItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          message: "Not enough stock",
        });
      }

      if (existingCartItem) {
        existingCartItem.quantity += 1;
        await cartItemsRepo.save(existingCartItem);
        return res.status(200).json({
          message: "Product added successfully",
          cartItem: existingCartItem,
        });
      }

      const newCartItem = cartItemsRepo.create({
        cart_id: userCart.id,
        product_id: productId,
        quantity: 1,
      });

      await cartItemsRepo.save(newCartItem);

      return res
        .status(200)
        .json({ message: "Item successfully added", cartItem: newCartItem });
    } else {
      const cart = cartRepo.create({
        user_id: id,
      });

      await cartRepo.save(cart);

      const newCartItem = cartItemsRepo.create({
        cart_id: cart.id,
        product_id: productId,
        quantity: 1,
      });

      await cartItemsRepo.save(newCartItem);

      return res
        .status(200)
        .json({ message: "Item successfully added", cartItem: newCartItem });
    }
  } catch (error) {
    next(error);
  }
}

export async function getCart(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const cartRepo = getRepo(CartsEntity);
    const cartItemRepo = getRepo(CartItemsEntity);

    const cart = await cartRepo.findOne({
      where: { user_id: id },
    });

    if (!cart) {
      return res
        .status(200)
        .json({ message: "No products in the cart", cart: [] });
    }

    const cartItems = await cartItemRepo.find({
      where: { cart_id: cart.id },
      relations: {
        product: {
          images: true,
        },
      },
    });

    const totalItems = cartItems.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);

    const subtotal = cartItems.reduce((acc, item) => {
      return acc + item.quantity * item.product.price;
    }, 0);

    return res.status(200).json({
      message: "Cart fetched successfully",
      cart: cartItems,
      totalItems,
      subtotal,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCartItem(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);

    const cartRepo = getRepo(CartsEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);

    const cart = await cartRepo.findOne({
      where: {
        user_id: id,
      },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItem = await cartItemsRepo.findOne({
      where: {
        cart_id: cart.id,
        product_id: productId,
      },
    });

    if (!cartItem) {
      return res.status(400).json({ message: "Item doesn't exist" });
    }

    await cartItemsRepo.remove(cartItem);

    return res
      .status(200)
      .json({ message: "Product removed from cart", cartItem });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItemQuantity(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);
    const productRepo = getRepo(ProductsEntity);
    const cartsRepo = getRepo(CartsEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);

    const userCart = await cartsRepo.findOne({
      where: { user_id: id },
    });

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const updatedProduct = await cartItemsRepo.findOne({
      where: { cart_id: userCart.id, product_id: productId },
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product in cart not found" });
    }

    if (updatedProduct.quantity === 1) {
      await cartItemsRepo.remove(updatedProduct);
      return res.status(200).json({
        message: "Product removed from the cart",
        updatedProduct: updatedProduct,
      });
    }

    updatedProduct.quantity = updatedProduct.quantity - 1;

    await cartItemsRepo.save(updatedProduct);

    return res.status(200).json({
      message: "Cart updated successfully",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
}