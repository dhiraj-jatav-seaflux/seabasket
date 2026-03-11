import { CategoriesEntity, ProductsEntity } from "@entities";
import { getRepo } from "@helpers";
import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";

export async function getProducts(req: TRequest, res: TResponse, next: NextFunction) {
  try {
    const productsRepo = getRepo(ProductsEntity);

    const { page, limit } = req.pager;

    const skip = (page - 1) * limit;

    const { name, minPrice, maxPrice, minRating, minDiscount, categoryId, sortBy, order, isTrending } = req.query;

    const query = productsRepo.createQueryBuilder("product").leftJoinAndSelect("product.category", "category").leftJoinAndSelect("product.images", "images");

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

export async function getProduct(req: TRequest, res: TResponse, next: NextFunction) {
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
    res.status(200).json({ message: "Product fetched successfully", product: product });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: TRequest, res: TResponse, next: NextFunction) {
  try {
    const categoriesRepo = getRepo(CategoriesEntity);
    const categories = await categoriesRepo.find();
    res.status(200).json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    next(error);
  }
}
