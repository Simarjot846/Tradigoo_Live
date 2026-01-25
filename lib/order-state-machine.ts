import { OrderStatus } from './supabase';

export const ORDER_STATES: OrderStatus[] = [
    'ORDER_CREATED',
    'PAYMENT_HELD',
    'SHIPPED',
    'DELIVERED',
    'OTP_CONFIRMED',
    'INSPECTION_PENDING',
    'PAYMENT_RELEASED',
    'DISPUTED',
    'CANCELLED',
    'REFUNDED'
];

// Valid transitions mapping
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    'ORDER_CREATED': ['PAYMENT_HELD', 'CANCELLED'],
    'PAYMENT_HELD': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'DISPUTED'], // Buyers can dispute if not delivered? No, usually delivered first.
    'DELIVERED': ['OTP_CONFIRMED', 'DISPUTED'], // Otp confirmed OR dispute (e.g. wrong item)
    'OTP_CONFIRMED': ['INSPECTION_PENDING', 'DISPUTED'], // Auto transition or dispute
    'INSPECTION_PENDING': ['PAYMENT_RELEASED', 'DISPUTED'], // Auto release or dispute raised
    'PAYMENT_RELEASED': [], // Terminal state
    'DISPUTED': ['PAYMENT_RELEASED', 'REFUNDED'], // Admin resolution
    'CANCELLED': [], // Terminal state
    'REFUNDED': []   // Terminal state
};

export function validateTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validNextStates = VALID_TRANSITIONS[currentStatus];
    if (!validNextStates) return false;
    return validNextStates.includes(newStatus);
}

export function getNextStepDescription(status: OrderStatus, role: 'retailer' | 'wholesaler'): string {
    switch (status) {
        case 'ORDER_CREATED':
            return role === 'retailer' ? 'Make payment to secure order' : 'Waiting for payment';
        case 'PAYMENT_HELD':
            return role === 'wholesaler' ? 'Pack and ship the order' : 'Waiting for shipment';
        case 'SHIPPED':
            return role === 'retailer' ? 'Share OTP upon delivery' : 'Transit in progress';
        case 'DELIVERED':
            return role === 'retailer' ? 'Verify goods with OTP' : 'Waiting for OTP confirmation';
        case 'OTP_CONFIRMED':
            return 'Inspection window active';
        case 'INSPECTION_PENDING':
            return role === 'retailer' ? 'Check goods - Raise dispute if needed' : 'Waiting for inspection expiry';
        case 'DISPUTED':
            return 'Under manual review';
        case 'PAYMENT_RELEASED':
            return 'Transaction completed';
        default:
            return '';
    }
}
