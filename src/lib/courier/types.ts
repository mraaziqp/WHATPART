export type CourierCode = 'the_courier_guy' | 'ram' | 'pargo' | 'other';

export type ShipmentStatus =
  | 'BOOKED'
  | 'COLLECTION_PENDING'
  | 'COLLECTED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export interface TrackingEvent {
  timestamp: string;
  status: ShipmentStatus;
  description: string;
  location?: string;
}

export interface TrackingInfo {
  courierCode: CourierCode;
  courierName: string;
  trackingNumber: string;
  status: ShipmentStatus;
  statusLabel: string;
  trackingUrl: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

export interface CourierOption {
  code: CourierCode;
  name: string;
  trackingUrlTemplate: (ref: string) => string;
}
