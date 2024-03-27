import fs from 'fs';
import __dirname from '../utils.js';

export class ProductsManagerFS {
    static #instance;

    constructor() {
        this.path = `${__dirname}/data/products.json`;
        this.products = [];
    }

    static getInstance() {
        if (!ProductsManagerFS.#instance) {
            ProductsManagerFS.#instance = new ProductsManagerFS();
        }
        return ProductsManagerFS.#instance;
    }

    async getProducts(limit) {
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(response);
            if (limit) {
                return this.products.slice(0, limit);
            }
            return this.products;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(response);
            const product = this.products.find(product => product.id === id);
            if (!product) {
                throw new Error(`No se encontró el producto con id ${id}`);
            }
            return product;
        } catch (error) {
            throw error;
        }
    }

    async addProduct(newProduct) {
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(response);
            if (this.products.find(product => product.code === newProduct.code)) {
                throw new Error(`Ya existe un producto con el código ${newProduct.code}`);
            }
            const product = {
                id: this.products.length !== 0 ? this.products[this.products.length - 1].id + 1 : 1,
                ...newProduct
            };
            this.products.push(product);
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, '\t'));
            return product;
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(response);
            const productIndex = this.products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                throw new Error(`No se encontró el producto con id ${id}`);
            }
            if (this.products.find(product => product.code === updatedProduct.code)) {
                throw new Error(`Ya existe un producto con el código ${updatedProduct.code}`);
            }
            const product = {
                id,
                ...updatedProduct
            };
            this.products[productIndex] = product;
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, '\t'));
            return product;
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const response = await fs.promises.readFile(this.path, 'utf-8');
            this.products = JSON.parse(response);
            const productIndex = this.products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                throw new Error(`No se encontró el producto con id ${id}`);
            }
            const product = this.products[productIndex];
            this.products.splice(productIndex, 1);
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, '\t'));
            return product;
        } catch (error) {
            throw error;
        }
    }
}