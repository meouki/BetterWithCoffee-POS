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
            const { pendingSizes, pendingBaseRecipes, pendingSizeRecipes, ...coreData } = productData;
            let dataToSend = coreData;

            if (productData.imageFile) {
                const formData = new FormData();
                formData.append('name', coreData.name);
                formData.append('category_name', coreData.category_name);
                formData.append('base_price', coreData.base_price);
                formData.append('is_available', coreData.is_available);
                formData.append('modifiers', coreData.modifiers);
                formData.append('has_sugar_selector', coreData.has_sugar_selector);
                formData.append('has_sizes', coreData.has_sizes);
                formData.append('addons', JSON.stringify(coreData.addons || []));
                formData.append('image', productData.imageFile);
                dataToSend = formData;
            }

            // 1. Create Product
            const newProduct = await productsApi.create(dataToSend);
            
            // 2. Handle Base Recipe
            if (pendingBaseRecipes && pendingBaseRecipes.length > 0) {
                const { recipesApi } = await import('../api/inventory');
                await Promise.all(pendingBaseRecipes.map(recipe => 
                    recipesApi.create({ ...recipe, product_id: newProduct.id, size_id: null })
                ));
            }

            // 3. Handle Sizes and their recipes
            if (pendingSizes && pendingSizes.length > 0) {
                const { productSizesApi, recipesApi } = await import('../api/inventory');
                for (const tempSize of pendingSizes) {
                    const createdSize = await productSizesApi.create({
                        product_id: newProduct.id,
                        name: tempSize.name,
                        price_adjustment: tempSize.price_adjustment
                    });

                    const sizeRecipes = pendingSizeRecipes[tempSize.id] || [];
                    if (sizeRecipes.length > 0) {
                        await Promise.all(sizeRecipes.map(recipe => 
                            recipesApi.create({ ...recipe, product_id: newProduct.id, size_id: createdSize.id })
                        ));
                    }
                }
            }

            setProducts(prev => [...prev, newProduct]);
            addNotification('MENU_EDIT', `Product Added: ${newProduct.name}`, `Added with ${pendingSizes?.length || 0} variants`);

            return newProduct;
        } catch (err) {
            console.error('Failed to add product', err);
            throw err;
        }
    }, [addNotification]);

    const updateProduct = useCallback(async (id, updateData) => {
        try {
            const { pendingSizes, pendingBaseRecipes, pendingSizeRecipes, ...coreData } = updateData;
            let dataToSend = coreData;

            if (updateData.imageFile) {
                const formData = new FormData();
                formData.append('name', coreData.name);
                formData.append('category_name', coreData.category_name);
                formData.append('base_price', coreData.base_price);
                formData.append('is_available', coreData.is_available);
                formData.append('modifiers', coreData.modifiers);
                formData.append('has_sugar_selector', coreData.has_sugar_selector);
                formData.append('has_sizes', coreData.has_sizes);
                formData.append('addons', JSON.stringify(coreData.addons || []));
                formData.append('image', updateData.imageFile);
                if (updateData.image_url === '') formData.append('image_url', '');
                dataToSend = formData;
            }

            const updatedProduct = await productsApi.update(id, dataToSend);

            // Handle Base Recipe updates for non-size products
            if (!updatedProduct.has_sizes && pendingBaseRecipes) {
                const { recipesApi } = await import('../api/inventory');
                // For simplicity in update, we just ensure these are sent. 
                // A better way would be to sync, but the bridge here handles immediate creation
                await Promise.all(pendingBaseRecipes.map(recipe => 
                    recipesApi.create({ ...recipe, product_id: id, size_id: null })
                ));
            }

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
                addCategory: useCallback(async (name) => {
                    const newCat = await categoriesApi.create({ name });
                    setCategories(prev => [...prev, newCat]);
                    addNotification('MENU_EDIT', 'New Category', `Created "${name}" group.`);
                }, [addNotification]),
                deleteCategory: useCallback(async (id) => {
                    await categoriesApi.delete(id);
                    setCategories(prev => prev.filter(c => c.id !== id));
                }, [])
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
