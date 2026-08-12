import { create } from 'zustand';
import { Product } from '../data/catalogData';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ActiveVehicle {
  make: string;
  model: string;
  year: string;
  engine: string;
  vin?: string;
  displayName: string;
}

interface AppState {
  // Cart state
  cartItems: CartItem[];
  isCartOpen: boolean;

  // Active Vehicle state
  activeVehicle: ActiveVehicle;

  // Location / Session state
  selectedCity: string;
  customerSession: {
    fullName: string;
    email: string;
    phone: string;
    province: string;
  } | null;

  // Cart actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Vehicle actions
  setActiveVehicle: (vehicle: Partial<ActiveVehicle>) => void;
  setSelectedCity: (city: string) => void;
  setCustomerSession: (session: AppState['customerSession']) => void;

  // Computed values helpers
  getCartSubtotal: () => number;
  getCartItemCount: () => number;
  getShippingFee: (courier?: 'courier_guy' | 'ram' | 'pargo') => number;
  getCartTotal: (courier?: 'courier_guy' | 'ram' | 'pargo') => number;
}

export const useStore = create<AppState>((set, get) => ({
  cartItems: [],
  isCartOpen: false,

  activeVehicle: {
    make: '',
    model: '',
    year: '',
    engine: '',
    displayName: '',
  },

  selectedCity: '',
  customerSession: null,

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingIndex = state.cartItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex > -1) {
        const updated = [...state.cartItems];
        updated[existingIndex].quantity += quantity;
        return { cartItems: updated, isCartOpen: true };
      }

      return {
        cartItems: [...state.cartItems, { product, quantity }],
        isCartOpen: true,
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          cartItems: state.cartItems.filter((item) => item.product.id !== productId),
        };
      }
      return {
        cartItems: state.cartItems.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    });
  },

  clearCart: () => set({ cartItems: [] }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setActiveVehicle: (vehicle) => {
    set((state) => {
      const newMake = vehicle.make || state.activeVehicle.make;
      const newModel = vehicle.model || state.activeVehicle.model;
      const newYear = vehicle.year || state.activeVehicle.year;
      const newEngine = vehicle.engine || state.activeVehicle.engine;
      const displayName = `${newYear} ${newMake} ${newModel} ${newEngine}`.trim();

      return {
        activeVehicle: {
          make: newMake,
          model: newModel,
          year: newYear,
          engine: newEngine,
          vin: vehicle.vin || state.activeVehicle.vin,
          displayName,
        },
      };
    });
  },

  setSelectedCity: (city) => set({ selectedCity: city }),
  setCustomerSession: (session) => set({ customerSession: session }),

  getCartSubtotal: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + item.product.priceZAR * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  getShippingFee: (courier = 'courier_guy') => {
    const subtotal = get().getCartSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal >= 1500) return 0; // Free delivery over R1,500

    switch (courier) {
      case 'ram': return 195;
      case 'pargo': return 85;
      case 'courier_guy':
      default: return 150;
    }
  },

  getCartTotal: (courier = 'courier_guy') => {
    return get().getCartSubtotal() + get().getShippingFee(courier);
  },
}));
