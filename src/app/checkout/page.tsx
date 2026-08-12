import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ShieldCheck, 
  Truck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  MapPin
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { checkoutFormSchema, CheckoutFormValues } from '../../utils/validationSchemas';
import { formatZAR } from '../../utils/formatters';

interface CheckoutPageProps {
  onBackToCart?: () => void;
  onOrderSuccess?: (orderId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onOrderSuccess,
}) => {
  const { cartItems, getCartSubtotal, clearCart, customerSession } = useStore();
  const [courierOption, setCourierOption] = useState<'courier_guy' | 'ram' | 'pargo'>('courier_guy');
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'ozow' | 'card' | 'quote'>('payfast');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [completedOrderRef, setCompletedOrderRef] = useState('');

  const subtotal = getCartSubtotal();
  const freeThreshold = 1500;
  const isFreeDelivery = subtotal >= freeThreshold;

  const courierRates = {
    courier_guy: isFreeDelivery ? 0 : 150,
    ram: isFreeDelivery ? 45 : 195,
    pargo: isFreeDelivery ? 0 : 85,
  };

  const deliveryFee = courierRates[courierOption];
  const grandTotal = subtotal + deliveryFee;
  const vatAmount = grandTotal * 0.15;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: customerSession?.fullName || '',
      email: customerSession?.email || '',
      phone: customerSession?.phone || '',
      streetAddress: '',
      suburb: '',
      city: '',
      province: 'Gauteng',
      courierOption: 'courier_guy',
      paymentMethod: 'payfast',
    },
  });

  const handleFormSubmit = async (data: CheckoutFormValues) => {
    setIsProcessing(true);
    // TODO: Integrate with PayFast/Ozow payment gateway
    // 1. POST order to /api/orders with cart items + delivery address
    // 2. Receive payment redirect URL from gateway
    // 3. Redirect customer to payment page
    // 4. Handle webhook callback for payment confirmation
    console.log('Checkout submission:', { ...data, courierOption, paymentMethod, cartItems });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    const orderId = `WP-${Date.now().toString(36).toUpperCase()}`;
    setCompletedOrderRef(orderId);
    setOrderCompleted(true);
    setIsProcessing(false);
    clearCart();
    if (onOrderSuccess) onOrderSuccess(orderId);
  };

  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30">
            ORDER REFERENCE: {completedOrderRef}
          </span>
          <h1 className="text-3xl font-black text-white">Payment Confirmed & Dispatching!</h1>
          <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
            Thank you for your order with WHATPART. Your OEM parts order has been transmitted to our warehouse.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left space-y-4 max-w-xl mx-auto text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">WHATPART Marketplace Tax Invoice</h3>
              <p className="text-slate-400 text-[11px]">VAT Reg No: Pending Registration</p>
            </div>
            <span className="text-emerald-400 font-bold font-mono">PAID IN FULL</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Total Paid (incl 15% VAT):</span>
            <span className="font-mono font-bold text-amber-400 text-base">{formatZAR(grandTotal)}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Shipping via <strong>{courierOption === 'courier_guy' ? 'The Courier Guy Express' : courierOption === 'ram' ? 'RAM Overnight' : 'Pargo Drop Point'}</strong>. Tracking link dispatched via SMS.</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToCart && (
            <button
              onClick={onBackToCart}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
              aria-label="Back to Cart"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Lock className="w-6 h-6 text-amber-400" />
              <span>Checkout & Payment</span>
            </h1>
            <p className="text-xs text-slate-400">Encrypted PayFast / Ozow 256-bit SSL Gateway</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Fitment Guarantee Included</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details & Courier Selector */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Delivery Address Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>1. Delivery Address (South Africa)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Name *</label>
                <input
                  {...register('fullName')}
                  type="text"
                  className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    errors.fullName ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {errors.fullName && <p className="text-red-400 text-[11px]">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">SA Mobile Number *</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    errors.phone ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {errors.phone && <p className="text-red-400 text-[11px]">{errors.phone.message}</p>}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-300">Email Address *</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                    errors.email ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {errors.email && <p className="text-red-400 text-[11px]">{errors.email.message}</p>}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-300">Street Address *</label>
                <input {...register('streetAddress')} type="text" placeholder="e.g. 142 Jan Smuts Avenue" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.streetAddress ? 'border-red-500' : 'border-slate-700'}`} />
                {errors.streetAddress && <p className="text-red-400 text-[11px]">{errors.streetAddress.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Suburb *</label>
                <input {...register('suburb')} type="text" placeholder="e.g. Rosebank" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.suburb ? 'border-red-500' : 'border-slate-700'}`} />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">City / Metro *</label>
                <input {...register('city')} type="text" placeholder="e.g. Johannesburg" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.city ? 'border-red-500' : 'border-slate-700'}`} />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Province *</label>
                <select {...register('province')} className="w-full h-11 bg-slate-950 text-white px-3 rounded-xl border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500">
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Postal Code *</label>
                <input {...register('postalCode')} type="text" placeholder="e.g. 2196" className={`w-full h-11 bg-slate-950 text-white px-3.5 rounded-xl border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${errors.postalCode ? 'border-red-500' : 'border-slate-700'}`} />
                {errors.postalCode && <p className="text-red-400 text-[11px]">{errors.postalCode.message}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Courier Shipping Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>2. Select SA Courier Service</span>
            </h2>

            <div className="space-y-3">
              {[
                { key: 'courier_guy' as const, label: '🚚 The Courier Guy Express', desc: 'Door-to-door nationwide delivery (24-48 hours)', rate: courierRates.courier_guy },
                { key: 'ram' as const, label: '⚡ RAM Hand-to-Hand Courier', desc: 'High-value insured express air shipment (Next Day)', rate: courierRates.ram },
                { key: 'pargo' as const, label: '📦 Pargo Smart Pickup Point', desc: 'Collect at your local Caltex / FreshStop counter', rate: courierRates.pargo },
              ].map((c) => (
                <label
                  key={c.key}
                  onClick={() => setCourierOption(c.key)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                    courierOption === c.key
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="courier" checked={courierOption === c.key} onChange={() => setCourierOption(c.key)} className="accent-amber-500 w-4 h-4 cursor-pointer" />
                    <div>
                      <strong className="text-sm block">{c.label}</strong>
                      <span className="text-xs text-slate-400">{c.desc}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {c.rate === 0 ? 'FREE' : formatZAR(c.rate)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Gateway */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>3. Payment Gateway Handoff</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button type="button" onClick={() => setPaymentMethod('payfast')} className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-2 transition ${paymentMethod === 'payfast' ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">PayFast Gateway</span>
                  {paymentMethod === 'payfast' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Visa, Mastercard, Debit, Mobicred & Scantopay</p>
              </button>

              <button type="button" onClick={() => setPaymentMethod('ozow')} className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-2 transition ${paymentMethod === 'ozow' ? 'bg-amber-500/15 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Ozow Instant EFT</span>
                  {paymentMethod === 'ozow' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">Capitec, FNB, ABSA, Standard Bank & TymeBank</p>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 sticky top-28 shadow-xl">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-amber-400 font-mono">{cartItems.length} Items</span>
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-850">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono text-[10px] flex items-center justify-center font-bold">{quantity}x</span>
                    <span className="text-slate-200 truncate">{product.title}</span>
                  </div>
                  <span className="font-mono text-white font-semibold">{formatZAR(product.priceZAR * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatZAR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Courier Delivery ({courierOption})</span>
                <span className="font-mono text-white">
                  {deliveryFee === 0 ? <strong className="text-emerald-400">FREE</strong> : formatZAR(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Includes 15% SA VAT:</span>
                <span className="font-mono">{formatZAR(vatAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white border-t border-slate-800 pt-3">
                <span>Total Due (ZAR)</span>
                <span className="font-mono text-amber-400 text-xl">{formatZAR(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || cartItems.length === 0}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting PayFast...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {formatZAR(grandTotal)} Now</span>
                </>
              )}
            </button>

            <div className="text-[10px] text-slate-500 text-center space-y-1">
              <p>🔒 256-Bit Bank Grade Security Encryption</p>
              <p>Secured by PayFast & Ozow</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
