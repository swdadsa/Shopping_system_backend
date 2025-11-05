import { Request, Response } from "express";
import { apiResponse } from "../response/apiResponse";
import Advertisement from "../models/Advertisement";
import path from "path";
import { deleteObjectsFromS3, uploadBufferToS3 } from "../utils/s3Client";
import { resolveImageUrl } from "../utils/imageUrl";

export default class advertisement {
  public apiResponse = new apiResponse;

  unitTest(req: Request, res: Response) {
    try {
      res.send(this.apiResponse.response(true, "advertisement unit test"));
    } catch (error) {
      res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)));
    }
  }

  async index(req: Request, res: Response) {
    try {
      const query = await Advertisement.findAll({
        attributes: ["id", "item_id", "image_path"]
      });

      const output = await Promise.all(
        query.map(async (index: any) => {
          return {
            ...index?.toJSON(),
            image_path: await resolveImageUrl(index.image_path)
          };
        })
      );

      res.send(this.apiResponse.response(true, output));
    } catch (error) {
      res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)));
    }
  }

  async store(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json(this.apiResponse.response(false, "No image uploaded"));
        return;
      }

      const file = req.file as Express.Multer.File;
      const extension = path.extname(file.originalname) ?? "";
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const key = `advertisements/${req.body.item_id ?? "general"}-${uniqueSuffix}${extension}`;

      const uploadResult = await uploadBufferToS3({
        buffer: file.buffer,
        key,
        contentType: file.mimetype,
      });

      const query = await Advertisement.create({
        "item_id": req.body.item_id,
        "image_path": uploadResult.key
      });

      if (query) {
        res.send(this.apiResponse.response(true, query));
      } else {
        res.status(500).json(this.apiResponse.response(false, "create ads failed"));
      }
    } catch (error) {
      res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)));
    }
  }

  async update(req: Request, res: Response) {
    try {
      const query = await Advertisement.findOne({
        where: {
          "item_id": req.body.item_id
        }
      });

      if (!query) {
        res.status(500).json(this.apiResponse.response(false, "update ads failed"));
        return;
      }

      if (!req.file) {
        res.status(400).json(this.apiResponse.response(false, "No image uploaded"));
        return;
      }

      if (query.image_path && !query.image_path.startsWith("images/")) {
        await deleteObjectsFromS3([query.image_path]);
      }

      const file = req.file as Express.Multer.File;
      const extension = path.extname(file.originalname) ?? "";
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const key = `advertisements/${query.item_id}-${uniqueSuffix}${extension}`;

      const uploadResult = await uploadBufferToS3({
        buffer: file.buffer,
        key,
        contentType: file.mimetype,
      });

      await query.update({
        "image_path": uploadResult.key
      });

      res.send(this.apiResponse.response(true, "update ads successfully"));
    } catch (error) {
      res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)));
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const query = await Advertisement.findOne({
        where: {
          "item_id": req.body.item_id
        }
      });

      if (query) {
        if (query.image_path && !query.image_path.startsWith("images/")) {
          await deleteObjectsFromS3([query.image_path]);
        }
        await query.destroy();
      }

      res.send(this.apiResponse.response(true, "delete ads successfully"));
    } catch (error) {
      res.status(500).json(this.apiResponse.response(false, error instanceof Error ? error.message : String(error)));
    }
  }
}
