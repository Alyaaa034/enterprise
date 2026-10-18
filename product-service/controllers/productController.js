const productModel = require('../models/productModel');
const validateImage = require('./imageValidation');

async function index(req, res) {
    try {
        const products = await productModel.getAllProducts();
        res.json({
            message: 'Berhasil mengambil data produk',
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil data produk',
            error: error.message,
        });
    }
}

async function show(req, res) {
    try {
        const product = await productModel.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan',
            });
        }

        res.json({
            message: 'Berhasil mengambil detail produk',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal mengambil detail produk',
            error: error.message,
        });
    }
}

async function store(req, res) {
    const imageError = validateImage(req.body.image);
    if (imageError) {
        return res.status(400).json({ message: imageError });
    }

    try {
        const product = await productModel.createProduct(req.body);
        res.status(201).json({
            message: 'Produk berhasil ditambahkan',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menambahkan produk',
            error: error.message,
        });
    }
}

async function update(req, res) {
    try {
        const product = await productModel.updateProduct(req.params.id, req.body);

        if (!product) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan',
            });
        }

        res.json({
            message: 'Produk berhasil diperbarui',
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal memperbarui produk',
            error: error.message,
        });
    }
}

async function destroy(req, res) {
    try {
        const deleted = await productModel.deleteProduct(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan',
            });
        }

        res.json({
            message: 'Produk berhasil dihapus',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menghapus produk',
            error: error.message,
        });
    }
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy,
};