import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { recipesApi, inventoryApi } from '../../api/inventory';
import styles from './RecipeBuilder.module.css';

/**
 * RecipeBuilder — shows existing recipes for a product+size and lets you add/remove them.
 * Props:
 *  productId  — saved product ID (null for brand-new unsaved products)
 *  sizeId     — null means "base product" recipe (no size)
 *  ingredients — list of all inventory ingredients [{ id, name, unit }]
 *  pendingRecipes — used when productId is null (offline mode for new products)
 *  onPendingChange — callback(sizeId, recipes[]) for new-product flow
 */
export default function RecipeBuilder({ productId, sizeId = null, ingredients, pendingRecipes, onPendingChange }) {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newIngId, setNewIngId] = useState('');
    const [newQty, setNewQty] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Determine whether we're working offline (new product) or live (saved product)
    const isLive = !!productId;

    useEffect(() => {
        if (!isLive) {
            // New product: use pendingRecipes passed down
            setRecipes(pendingRecipes || []);
            return;
        }
        // Saved product: fetch live from server
        setIsLoading(true);
        recipesApi.getByProduct(productId)
            .then(data => {
                // Filter by sizeId
                const filtered = data.filter(r =>
                    sizeId === null ? r.size_id === null : r.size_id === sizeId
                );
                setRecipes(filtered);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [productId, sizeId, isLive, pendingRecipes]);

    const handleAdd = async () => {
        if (!newIngId || !newQty || parseFloat(newQty) <= 0) return;

        const ingredient = ingredients.find(i => String(i.id) === String(newIngId));
        if (!ingredient) return;

        if (isLive) {
            setIsAdding(true);
            try {
                const created = await recipesApi.create({
                    product_id: productId,
                    size_id: sizeId,
                    inventory_id: parseInt(newIngId),
                    quantity: parseFloat(newQty),
                });
                // Attach ingredient info for display
                setRecipes(prev => [...prev, { ...created, ingredient }]);
                setNewIngId('');
                setNewQty('');
            } catch (err) {
                console.error('Failed to add recipe:', err);
            } finally {
                setIsAdding(false);
            }
        } else {
            // Offline mode for new products
            const newEntry = {
                id: `pending-${Date.now()}`,
                inventory_id: parseInt(newIngId),
                quantity: parseFloat(newQty),
                ingredient,
                size_id: sizeId,
            };
            const updated = [...recipes, newEntry];
            setRecipes(updated);
            onPendingChange?.(sizeId, updated);
            setNewIngId('');
            setNewQty('');
        }
    };

    const handleRemove = async (recipe) => {
        if (isLive && !String(recipe.id).startsWith('pending')) {
            try {
                await recipesApi.delete(recipe.id);
            } catch (err) {
                console.error('Failed to delete recipe:', err);
                return;
            }
        }
        const updated = recipes.filter(r => r.id !== recipe.id);
        setRecipes(updated);
        if (!isLive) onPendingChange?.(sizeId, updated);
    };

    // Filter out already-added ingredients
    const availableIngredients = ingredients.filter(
        ing => !recipes.some(r => r.inventory_id === ing.id)
    );

    if (isLoading) return <div className={styles.loadingText}>Loading recipe...</div>;

    return (
        <div className={styles.recipeSection}>
            <div className={styles.recipeHeader}>
                <FlaskConical size={14} className={styles.recipeIcon} />
                <span className={styles.recipeTitle}>Recipe</span>
            </div>

            {recipes.length === 0 && (
                <div className={styles.emptyRecipe}>No ingredients linked yet.</div>
            )}

            {recipes.map(recipe => {
                const ing = recipe.ingredient || ingredients.find(i => i.id === recipe.inventory_id);
                return (
                    <div key={recipe.id} className={styles.recipeRow}>
                        <span className={styles.recipeIngName}>{ing?.name ?? `#${recipe.inventory_id}`}</span>
                        <span className={styles.recipeQty}>{recipe.quantity} {ing?.unit ?? ''}</span>
                        <button className={styles.removeBtn} onClick={() => handleRemove(recipe)} title="Remove">
                            <Trash2 size={13} />
                        </button>
                    </div>
                );
            })}

            {/* Add row */}
            <div className={styles.addRow}>
                <select
                    className={styles.ingSelect}
                    value={newIngId}
                    onChange={e => setNewIngId(e.target.value)}
                >
                    <option value="">Pick ingredient...</option>
                    {availableIngredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                </select>
                <input
                    className={styles.qtyInput}
                    type="number"
                    min="0.001"
                    step="any"
                    placeholder="Qty"
                    value={newQty}
                    onChange={e => setNewQty(e.target.value)}
                />
                <button
                    className={styles.addIngBtn}
                    onClick={handleAdd}
                    disabled={isAdding || !newIngId || !newQty}
                    title="Add ingredient to recipe"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}
