import { useState } from 'react';
import HeaderBar from '../../components/pos/HeaderBar';
import OrderTypeSelector from '../../components/pos/OrderTypeSelector';
import CategoryTabBar from '../../components/pos/CategoryTabBar';
import MenuGrid from '../../components/pos/MenuGrid';
import FloatingCartButton from '../../components/pos/FloatingCartButton';
import CartDrawer from '../../components/pos/CartDrawer';
import ModifierSheet from '../../components/pos/ModifierSheet';
import CheckoutModal from '../../components/pos/CheckoutModal';
import styles from './POSInterface.module.css';

export default function POSInterface() {
    const [orderType, setOrderType] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [cartItems, setCartItems] = useState([]);

    // Modals state
    const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Modifier sheet state
    const [activeProduct, setActiveProduct] = useState(null);

    const handleOrderTypeSelect = (type) => {
        setOrderType(type);
        setIsOrderTypeModalOpen(false);
    };

    const handleChangeOrderType = () => {
        // Note: In real app, confirm before clearing cart
        setIsOrderTypeModalOpen(true);
    };

    const handleProductClick = (product) => {
        if (product.modifiers) {
            setActiveProduct(product);
        } else {
            addToCart({ ...product, price: product.base_price, quantity: 1 });
        }
    };

    const addToCart = (item) => {
        setCartItems(prev => {
            // Very basic add, real app would check modifiers array equality
            const existing = prev.find(i => i.id === item.id && JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers));
            if (existing) {
                return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    // Cart operations
    const updateQuantity = (index, delta) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const newQty = newItems[index].quantity + delta;
            if (newQty <= 0) {
                newItems.splice(index, 1);
            } else {
                newItems[index].quantity = newQty;
            }
            return newItems;
        });
    };

    const removeItem = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCartItems([]);

    const completeCheckout = () => {
        setCartItems([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        // Real app: Navigate or show success toast
    };

    return (
        <div className={styles.posLayout}>
            <HeaderBar
                orderType={orderType}
                onOrderTypeClick={handleChangeOrderType}
            />

            {isOrderTypeModalOpen && (
                <OrderTypeSelector onSelect={handleOrderTypeSelect} />
            )}

            {!isOrderTypeModalOpen && (
                <div className={styles.scrollArea}>
                    <CategoryTabBar
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                    />

                    <MenuGrid
                        category={activeCategory}
                        onProductClick={handleProductClick}
                    />
                </div>
            )}

            {/* Overlays / Drawers */}
            <FloatingCartButton
                itemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                onClick={() => setIsCartOpen(true)}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                orderType={orderType}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                onCheckout={() => setIsCheckoutOpen(true)}
            />

            <ModifierSheet
                isOpen={!!activeProduct}
                product={activeProduct}
                onClose={() => setActiveProduct(null)}
                onAddToCart={addToCart}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cartItems={cartItems}
                onComplete={completeCheckout}
            />
        </div>
    );
}
