import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import {
  CategoriesEntity,
  ProductImagesEntity,
  ProductsEntity,
} from "@entities";
import { getRepo, uploadToCloudinary } from "@helpers";
import cloudinary from "configs/cloudinary";

export async function postCategory(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { categoryName } = req.body;

    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const categoryRepository = getRepo(CategoriesEntity);

    const existingCategory = await categoryRepository.findOne({
      where: { category_name: categoryName.toLowerCase() },
    });

    if (existingCategory) {
      return res.status(409).json({ message: "Category already exist" });
    }

    const category = categoryRepository.create({
      category_name: categoryName.toLowerCase(),
    });

    await categoryRepository.save(category);

    res
      .status(201)
      .json({ message: "Category created successfully", category: category });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const {
      name,
      categoryId,
      description,
      price,
      discount,
      stock,
      isTrending,
    } = req.body;

    const productRepository = getRepo(ProductsEntity);
    const product = productRepository.create({
      name,
      category_id: categoryId,
      description,
      price,
      discount,
      stock,
      is_trending: isTrending,
    });
    await productRepository.save(product);

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    next(error);
  }
}

export async function uploadProductImage(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const imageRepo = getRepo(ProductImagesEntity);
    const files = req.files as Express.Multer.File[];

    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const productsRepo = getRepo(ProductsEntity);

    const product = await productsRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    const savedImages = [];

    for (const file of files) {
      const result: any = await uploadToCloudinary(file.buffer);

      const image = imageRepo.create({
        product_id: productId,
        image_url: result.secure_url,
        public_id: result.public_id,
      });

      await imageRepo.save(image);

      savedImages.push(image);
    }
    res.json({
      message: "Images uploaded successfully",
      images: savedImages,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);

    if (!req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const productRepo = getRepo(ProductsEntity);
    const imagesRepo = getRepo(ProductImagesEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });

    const images = await imagesRepo.find({
      where: { product_id: productId },
    });

    for (const img of images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    await imagesRepo.delete({ product_id: productId });

    await productRepo.delete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
}