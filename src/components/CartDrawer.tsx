import type React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatZAR } from '../utils/formatters';

interface CartDrawerProps {
  onNavigateToCheckout?: () => void;
  onNavigateToCatalog?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToCatalog,
}) => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    removeItem,
    updateQuantity,
    getCartSubtotal,
    getCartItemCount,
    getShippingFee,
    getCartTotal,
  } = useStore();

  const subtotal = getCartSubtotal();
  const itemCount = getCartItemCount();
  const shippingFee = getShippingFee();
  const total = getCartTotal();
  const isFreeShipping = subtotal >= 1500;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Your Cart</h2>
                  <span className="text-xs text-slate-400">{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {!isFreeShipping && subtotal > 0 && (
              <div className="px-4 pt-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs">
                  <div className="flex justify-between text-amber-300 font-semibold mb-1.5">
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Free Delivery Progress</span>
                    <span className="font-mono">{formatZAR(1500 - subtotal)} away</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
                  <p className="text-slate-400 text-sm font-semibold">Your cart is empty</p>
                  <button
                    onClick={() => { closeCart(); onNavigateToCatalog?.(); }}
                    className="px-6 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl uppercase"
                  >
                    Browse Parts
                  </button>
                </div>
              ) : (
                cartItems.map(({ product, quantity }) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="flex gap-3 bg-slate-950/80 rounded-xl border border-slate-800 p-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{product.oemNumber}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {formatZAR(product.priceZAR * quantity)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 rounded bg-slate-800 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-700 border border-slate-700"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 rounded bg-slate-800 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-700 border border-slate-700"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="w-6 h-6 rounded bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 ml-1"
                            aria-label={`Remove ${product.title}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-800 p-4 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">{formatZAR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Courier (Est.)</span>
                    <span className="font-mono text-white">
                      {isFreeShipping ? <strong className="text-emerald-400">FREE</strong> : formatZAR(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-2">
                    <span>Total</span>
                    <span className="font-mono text-amber-400">{formatZAR(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => { closeCart(); onNavigateToCheckout?.(); }}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Fitment Guarantee</span>
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> PayFast Secured</span>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
