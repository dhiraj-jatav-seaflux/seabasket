import {
  CartsEntity,
  CategoriesEntity,
  ProductsEntity,
  ReviewsEntity,
} from "@entities";
import { getRepo } from "@helpers";
import { TRequest, TResponse } from "@types";
import { CartItemsEntity } from "db/entities/cart-items.entity";
import { NextFunction } from "express";
import { finalDiscountPrice } from "@helpers";
import { TRatingDTO } from "./dtos/rating-dto";

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

    if (Number(minPrice) > 0) {
      query.andWhere(
        "(product.price - (product.price * product.discount / 100)) >= :minPrice",
        { minPrice: Number(minPrice) },
      );
    }

    if (Number(maxPrice) > 0) {
      query.andWhere(
        "(product.price - (product.price * product.discount / 100)) <= :maxPrice",
        { maxPrice: Number(maxPrice) },
      );
    }

    if (
      minRating &&
      minRating !== undefined &&
      minRating !== null &&
      minRating !== "0"
    ) {
      query.andWhere("product.rating >= :minRating", { minRating });
    }

    if (
      minDiscount &&
      minDiscount !== undefined &&
      minDiscount !== null &&
      minDiscount !== "0"
    ) {
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

    const productsWithDiscount = products.map((product) => ({
      ...product,
      finalPrice: finalDiscountPrice(
        Number(product.price),
        Number(product.discount || 0),
      ),
    }));

    res.status(200).json({
      message: "Products fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products: productsWithDiscount,
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
        reviews: {
          user: true,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        rating: true,
        discount: true,
        stock: true,
        is_trending: true,
        category: {
          id: true,
          category_name: true,
        },
        images: {
          id: true,
          image_url: true,
        },
        reviews: {
          id: true,
          comment: true,
          rating: true,
          user: {
            id: true,
            first_name: true,
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }
    const discountedPrice = finalDiscountPrice(
      Number(product.price),
      Number(product.discount || 0),
    );
    res.status(200).json({
      message: "Product fetched successfully",
      product: {
        ...product,
        finalPrice: discountedPrice,
      },
    });
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

export async function addReview(
  req: TRequest<TRatingDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const { id } = req.me;

    const { comment, rating } = req.dto;

    const productRepo = getRepo(ProductsEntity);
    const reviewsRepo = getRepo(ReviewsEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    const alreadyReviewed = await reviewsRepo.findOne({
      where: {
        product_id: productId,
        user_id: id,
      },
    });

    if (alreadyReviewed) {
      return res
        .status(409)
        .json({ message: "Review already added for this product" });
    }

    const review = reviewsRepo.create({
      product_id: productId,
      user_id: id,
      rating: rating,
      comment,
    });

    await reviewsRepo.save(review);

    const result = await reviewsRepo
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.product_id = :productId", { productId })
      .getRawOne();

    product.rating = Number(result.avg) || 0;

    await productRepo.save(product);

    res.status(200).json({ message: "Review added", review: review });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(
  req: TRequest<TRatingDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);

    const { rating, comment } = req.dto;

    const reviewsRepo = getRepo(ReviewsEntity);
    const productRepo = getRepo(ProductsEntity);

    const product = await productRepo.findOne({
      where:{id:productId}
    })

    if(!product){
      return res.status(404).json({message:'Product does not exist'})
    }

    const review = await reviewsRepo.findOne({
      where: { product_id: productId, user_id: id },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating;
    review.comment = comment;

    await reviewsRepo.save(review);

    const result = await reviewsRepo
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.product_id = :productId", { productId })
      .getRawOne();

    product.rating = Number(result.avg) || 0;

    await productRepo.save(product);

    return res
      .status(200)
      .json({ message: "Review updated successfully", updatedReview: review });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);

    const reviewsRepo = getRepo(ReviewsEntity);
    const productRepo = getRepo(ProductsEntity);

    const product =  await productRepo.findOne({
      where:{id:productId}
    })

    if(!product){
      return res.status(404).json({message:'Product does not exist'})
    }

    const review = await reviewsRepo.findOne({
      where: { product_id: productId, user_id: id },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await reviewsRepo.delete(review);

    const result = await reviewsRepo
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.product_id = :productId", { productId })
      .getRawOne();

    product.rating = Number(result.avg) || 0;

    await productRepo.save(product);

    return res
      .status(200)
      .json({ message: "Review deleted successfully", deletedReview: review });
  } catch (error) {
    next(error);
  }
}