// ============================================================
// Goldify — Shared TypeScript Interfaces
// ============================================================

export type UserRole = 'operator' | 'admin' | 'agent';

export interface GoldifyUser {
  uid: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt?: string;
}

// ---- Gold Rates ------------------------------------------------
export interface GoldRates {
  rate24k: number; // ₹ per gram
  rate22k: number;
  rate18k: number;
  rate14k: number;
  updatedAt: string; // ISO string
  source: 'simulated' | 'ibja' | 'mcx';
}

// ---- Karatage --------------------------------------------------
export type Karatage = 24 | 22 | 18 | 14 | 10;

// ---- Appointments ----------------------------------------------
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: 'kiosk' | 'home';
  kioskLocation?: string; 
  customerAddress?: string;
  scheduledAt: string; // ISO string
  status: AppointmentStatus;
  agentId?: string; // assigned agent for home service
  createdAt: string;
}

export interface CreateAppointmentPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: 'kiosk' | 'home';
  kioskLocation?: string;
  customerAddress?: string;
  scheduledAt: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentMethod = 'bank_transfer' | 'upi';

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}

export interface UpiDetails {
  vpa: string; // UPI ID
}

export interface CustomerPaymentInfo {
  preferredMethod: PaymentMethod;
  bank?: BankDetails;
  upi?: UpiDetails;
}

// ---- Customers (KYC) ------------------------------------------
export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idProofUrl: string;
  panCardUrl: string;
  kycVerified: boolean;
  paymentInfo?: CustomerPaymentInfo;
  createdAt: string;
  createdBy: string; // operator UID
}

// ---- Valuation -------------------------------------------------
export type ValuationStatus = 'draft' | 'offered' | 'accepted' | 'rejected';

export interface ValuationFormData {
  customerId: string;
  appointmentId?: string;
  grossWeightGrams: number;
  deductionsGrams: number; // clasp / stone weight subtracted
  netWeightGrams: number;
  xrfGoldPurity: number; // 0.0 – 1.0 (e.g. 0.916 for 22k)
  xrfSilverPct: number;
  xrfCopperPct: number;
  diamondVerified: boolean;
  diamondCarats?: number;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PayoutResult {
  karatage: number;
  baseGoldValue: number;
  spreadMarginPct: number;
  spreadAmount: number;
  finalOffer: number;
  goldRateUsed: number;
}

export interface Valuation extends ValuationFormData, PayoutResult {
  id: string;
  status: ValuationStatus;
  paymentStatus: PaymentStatus;
  disbursementRef?: string; // transaction reference ID
  processedAt?: string;
  operatorId: string;
  createdAt: string;
}

// ---- Inventory -------------------------------------------------
export type InventoryStream = 'unassigned' | 'b2b_scrap' | 'cpo';

export interface InventoryItem {
  id: string;
  valuationId: string;
  customerId: string;
  customerName: string;
  itemDescription: string;
  goldPurity: number;
  netWeightGrams: number;
  finalOffer: number;
  stream: InventoryStream;
  acquisitionDate: string;
  assignedBy?: string;
  assignedAt?: string;
  cpoListingPrice?: number;
  refineryRef?: string;
  diamondVerified: boolean;
  smartBagId?: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}
export interface RefineryBatch {
  id: string;
  itemIds: string[]; // IDs of InventoryItems in this batch
  status: 'preparing' | 'in_transit' | 'settled';
  totalIntakeWeight: number; 
  settledWeight?: number; 
  meltLossGrams?: number;
  refineryName: string;
  carrierRef?: string;
  shippedAt?: string;
  settledAt?: string;
  createdAt: string;
}

// ---- Kiosk Locations ------------------------------------------
export interface KioskLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  timings: string;
}

// ---- Estimator ------------------------------------------------
export interface EstimateInput {
  weightGrams: number;
  karatage: Karatage;
}

export interface EstimateResult {
  lowEstimate: number;
  midEstimate: number;
  highEstimate: number;
  rateUsed: number;
  karatage: Karatage;
  weightGrams: number;
}
