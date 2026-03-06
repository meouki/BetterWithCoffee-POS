import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial load
    useEffect(() => {
        let mounted = true;
        const loadProducts = async () => {
            try {
                const data = await productsApi.getAll();
                if (mounted) {
                    setProducts(data);
                    setIsLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    console.error('Failed to load products', err);
                    setError(err.message);
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            mounted = false;
        };
    }, []);

    const addProduct = useCallback(async (productData) => {
        try {
            const newProduct = await productsApi.create(productData);
            setProducts(prev => [...prev, newProduct]);
            return newProduct;
        } catch (err) {
            console.error('Failed to add product', err);
            throw err;
        }
    }, []);

    const updateProduct = useCallback(async (id, updateData) => {
        try {
            const updatedProduct = await productsApi.update(id, updateData);
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
            return updatedProduct;
        } catch (err) {
            console.error('Failed to update product', err);
            throw err;
        }
    }, []);

    const deleteProduct = useCallback(async (id) => {
        try {
            await productsApi.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete product', err);
            throw err;
        }
    }, []);

    const toggleAvailability = useCallback(async (id) => {
        try {
            const product = products.find(p => p.id === id);
            if (!product) return;
            const updatedProduct = await productsApi.update(id, { is_available: !product.is_available });
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        } catch (err) {
            console.error('Failed to toggle availability', err);
            throw err;
        }
    }, [products]);

    return (
        <ProductContext.Provider
            value={{
                products,
                isLoading,
                error,
                addProduct,
                updateProduct,
                deleteProduct,
                toggleAvailability
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProductContext() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider');
    }
    return context;
}
