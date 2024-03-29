import Product from "../models/product.model.js";

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const skip = (page - 1) * pageSize;

      const totalProducts = await Product.countDocuments();
      const totalPages = Math.ceil(totalProducts / pageSize);

      const products = await Product.find().skip(skip).limit(pageSize);

      res.json({
        page,
        pageSize,
        totalPages,
        totalProducts,
        products,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getProductdetail: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate(
        "category"
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  getProductStock: async (req, res) => {
    try {
      // Lấy ra productID
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get the current inventory quantity of the product
      const currentStock = product.stock;

      // Send the product inventory as the response
      res.status(200).json({ id, currentStock });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getFilterProduct: async (req, res) => {
    try {
      const { name, minPrice, maxPrice, brand } = req.query;  

      const filter = {};

      if (name) {
        filter.name = { $regex: new RegExp(name, "i") };
      }

      if (minPrice !== undefined && maxPrice !== undefined) {
        filter.price = {
          $gte: parseFloat(minPrice),
          $lte: parseFloat(maxPrice),
        };
      } else if (minPrice !== undefined) {
        filter.price = { $gte: parseFloat(minPrice) };
      } else if (maxPrice !== undefined) {
        filter.price = { $lte: parseFloat(maxPrice) };
      }

      if (brand) {
        filter.brand = brand;
      }

      // Find products that match the filter criteria
      const products = await Product.find(filter);

      // Send the filtered products as the response
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  createProduct: async (req, res) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const removedProduct = await Product.findByIdAndRemove(req.params.id);
      if (!removedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getProductsByCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const totalProducts = await Product.countDocuments({
        category: id,
      });

      const totalPages = Math.ceil(totalProducts / pageSize);

      const products = await Product.find({ category: id })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate("category");
      res.json({
        page,
        pageSize,
        totalPages,
        totalProducts,
        products,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getNewArrivals: async (req, res) => {
    try {
      // Logic to determine new arrivals, e.g., products added in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const newArrivals = await Product.find({
        createdAt: { $gte: sevenDaysAgo },
      }).populate("category");

      res.json({
        products: newArrivals,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

export default productController;
