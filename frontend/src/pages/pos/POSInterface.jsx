import { useState } from 'react';
import { useProductContext } from '../../context/ProductContext';
import { useOrderContext } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import HeaderBar from '../../components/pos/HeaderBar';
import OrderTypeSelector from '../../components/pos/OrderTypeSelector';
import CategoryTabBar from '../../components/pos/CategoryTabBar';
import MenuGrid from '../../components/pos/MenuGrid';
import FloatingCartButton from '../../components/pos/FloatingCartButton';
import CartDrawer from '../../components/pos/CartDrawer';
import ModifierSheet from '../../components/pos/ModifierSheet';
import CheckoutModal from '../../components/pos/CheckoutModal';
import ReceiptModal from '../../components/pos/ReceiptModal';
import toast from 'react-hot-toast';
import styles from './POSInterface.module.css';

export default function POSInterface() {
    const [orderType, setOrderType] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [cartItems, setCartItems] = useState([]);
    const { products } = useProductContext();
    const { createOrder } = useOrderContext();
    const { currentUser } = useAuth();

    // Modals state
    const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [activeReceipt, setActiveReceipt] = useState(null);

    // Modifier sheet state
    const [activeProduct, setActiveProduct] = useState(null);

    const handleOrderTypeSelect = (type) => {
        setOrderType(type);
        setIsOrderTypeModalOpen(false);
        toast.success(`Started ${type} Order`);
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
            const existing = prev.find(i => i.id === item.id && JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers));
            if (existing) {
                return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(<span>Added <b>{item.name}</b></span>, { duration: 1500 });
    };

    // Cart operations
    const updateQuantity = (index, delta) => {
        setCartItems(prev => {
            return prev.map((item, i) => {
                if (i !== index) return item;
                return { ...item, quantity: item.quantity + delta };
            }).filter(item => item.quantity > 0);
        });
    };

    const removeItem = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCartItems([]);
        toast("Cart Cleared", { icon: "🧹" });
    };

    const completeCheckout = async (orderData) => {
        try {
            const savedOrder = await createOrder({
                ...orderData,
                order_type: orderType,
                cashier: currentUser?.name || 'Unknown Staff'
            });
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
            setActiveReceipt(savedOrder);
            toast.success("Payment Received");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save order.");
        }
    };

    const handleNewOrder = () => {
        setCartItems([]);
        setActiveReceipt(null);
        setOrderType(null);
        setIsOrderTypeModalOpen(true);
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

            <ReceiptModal
                isOpen={!!activeReceipt}
                receiptData={activeReceipt}
                onNewOrder={handleNewOrder}
            />
        </div>
    );
}
