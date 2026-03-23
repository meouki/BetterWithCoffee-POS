import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { useNotificationContext } from './NotificationContext';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Initial load
    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        };

        let mounted = true;
        const loadData = async () => {
            setIsLoading(true); // Ensure it shows loading when user changes/logs in
            try {
                const [pData, cData] = await Promise.all([
                    productsApi.getAll(),
                    categoriesApi.getAll()
                ]);
                if (mounted) {
                    setProducts(pData);
                    setCategories(cData);
                    setIsLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    console.error('Failed to load menu data', err);
                    setError(err.message);
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [currentUser]);

    const { addNotification } = useNotificationContext();

    const addProduct = useCallback(async (productData) => {
        try {
            let dataToSend = productData;
            if (productData.imageFile) {
                const formData = new FormData();
                formData.append('name', productData.name);
                formData.append('category_name', productData.category_name);
                formData.append('base_price', productData.base_price);
                formData.append('is_available', productData.is_available);
                formData.append('modifiers', productData.modifiers);
                formData.append('has_sugar_selector', productData.has_sugar_selector);
                formData.append('has_milk_selector', productData.has_milk_selector);
                formData.append('addons', JSON.stringify(productData.addons || []));
                formData.append('image', productData.imageFile);
                dataToSend = formData;
            }

            const newProduct = await productsApi.create(dataToSend);
            setProducts(prev => [...prev, newProduct]);

            addNotification('MENU_EDIT', `Product Added: ${newProduct.name}`, `Added to ${newProduct.category_name} at ₱${newProduct.base_price}`);

            return newProduct;
        } catch (err) {
            console.error('Failed to add product', err);
            throw err;
        }
    }, [addNotification]);

    const updateProduct = useCallback(async (id, updateData) => {
        try {
            let dataToSend = updateData;
            if (updateData.imageFile) {
                const formData = new FormData();
                formData.append('name', updateData.name);
                formData.append('category_name', updateData.category_name);
                formData.append('base_price', updateData.base_price);
                formData.append('is_available', updateData.is_available);
                formData.append('modifiers', updateData.modifiers);
                formData.append('has_sugar_selector', updateData.has_sugar_selector);
                formData.append('has_milk_selector', updateData.has_milk_selector);
                formData.append('addons', JSON.stringify(updateData.addons || []));
                formData.append('image', updateData.imageFile);
                if (updateData.image_url === '') formData.append('image_url', ''); // Handle image removal
                dataToSend = formData;
            }

            const updatedProduct = await productsApi.update(id, dataToSend);
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));

            addNotification('MENU_EDIT', `Product Edited: ${updatedProduct.name}`, `Details updated by Admin`);

            return updatedProduct;
        } catch (err) {
            console.error('Failed to update product', err);
            throw err;
        }
    }, [addNotification]);

    const deleteProduct = useCallback(async (id) => {
        try {
            const product = products.find(p => p.id === id);
            await productsApi.delete(id);
            setProducts(prev => prev.filter(p => p.id !== id));

            if (product) {
                addNotification('MENU_EDIT', `Product Deleted: ${product.name}`, `Removed from menu`);
            }
        } catch (err) {
            console.error('Failed to delete product', err);
            throw err;
        }
    }, [products, addNotification]);

    const toggleAvailability = useCallback(async (id) => {
        try {
            const product = products.find(p => p.id === id);
            if (!product) return;
            const updatedProduct = await productsApi.update(id, { is_available: !product.is_available });
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));

            const status = updatedProduct.is_available ? 'Available' : 'Sold Out';
            addNotification('MENU_EDIT', `Availability Switched: ${updatedProduct.name}`, `Marked as ${status}`);

        } catch (err) {
            console.error('Failed to toggle availability', err);
            throw err;
        }
    }, [products, addNotification]);

    return (
        <ProductContext.Provider
            value={{
                products,
                isLoading,
                error,
                addProduct,
                updateProduct,
                deleteProduct,
                toggleAvailability,
                categories,
                addCategory: async (name) => {
                    const newCat = await categoriesApi.create({ name });
                    setCategories(prev => [...prev, newCat]);
                    addNotification('MENU_EDIT', 'New Category', `Created "${name}" group.`);
                },
                deleteCategory: async (id) => {
                    await categoriesApi.delete(id);
                    setCategories(prev => prev.filter(c => c.id !== id));
                }
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
