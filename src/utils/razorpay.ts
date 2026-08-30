/**
 * Razorpay Integration Helper Utility for Aapli Gaadi
 */

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface OpenRazorpayOptions {
  amount: number; // Amount in INR (Rupees)
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script into the document header.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Opens the Razorpay Checkout Modal overlay for processing instant online payments.
 */
export const openRazorpayCheckout = async (options: OpenRazorpayOptions): Promise<void> => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    alert('Failed to load Razorpay Payment Gateway SDK. Please check your internet connection and try again.');
    return;
  }

  // Fallback test key ID if VITE_RAZORPAY_KEY_ID is not provided in .env
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TPbkkB8mJCZ7Y4';

  const amountInPaise = Math.round(options.amount); // amount should already be in cents/paise for woodland river villas if passing totalCents

  const rzpOptions = {
    key: razorpayKey,
    amount: amountInPaise,
    currency: 'INR',
    name: options.name || 'Woodland River Villas',
    description: options.description || 'Villa Booking Payment',
    image: '/images/logo.png', // Assuming a logo path
    handler: function (response: RazorpayPaymentSuccessResponse) {
      if (options.onSuccess) {
        options.onSuccess(response);
      }
    },
    prefill: {
      name: options.prefill?.name || '',
      email: options.prefill?.email || '',
      contact: options.prefill?.contact || ''
    },
    notes: {
      merchant: 'Woodland River Villas Services',
      ...options.notes
    },
    theme: {
      color: '#4F46E5' // Indigo color typical for default themes
    },
    modal: {
      ondismiss: function () {
        if (options.onDismiss) {
          options.onDismiss();
        }
      }
    }
  };

  const razorpayInstance = new (window as any).Razorpay(rzpOptions);
  razorpayInstance.open();
};
