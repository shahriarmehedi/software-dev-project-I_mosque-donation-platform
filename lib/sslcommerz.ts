import crypto from 'crypto'

export interface SSLCommerzConfig {
  storeId: string
  storePassword: string
  isLive: boolean
}

export interface SSLCommerzPaymentData {
  amount: number
  currency: string
  tranId: string
  productName: string
  productCategory: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerCountry: string
  successUrl: string
  failUrl: string
  cancelUrl: string
  ipnUrl: string
  donationId?: string
  campaignId?: string
}

export interface SSLCommerzResponse {
  status: string
  failedreason?: string
  sessionkey?: string
  gw?: {
    visa?: string
    master?: string
    amex?: string
    othercards?: string
    internetbanking?: string
    mobilebanking?: string
  }
  redirectGatewayURL?: string
  directPaymentURLBank?: string
  directPaymentURLCard?: string
  directPaymentURL?: string
  redirectGatewayURLFailed?: string
  GatewayPageURL?: string
}

export interface SSLCommerzValidationResponse {
  status: string
  tran_date: string
  tran_id: string
  val_id: string
  amount: string
  store_amount: string
  currency: string
  bank_tran_id: string
  card_type: string
  card_no: string
  card_issuer: string
  card_brand: string
  card_issuer_country: string
  card_issuer_country_code: string
  verify_sign: string
  verify_key: string
  verify_sign_sha2: string
  currency_type: string
  currency_amount: string
  currency_rate: string
  base_fair: string
  value_a: string
  value_b: string
  value_c: string
  value_d: string
  risk_level: string
  risk_title: string
}

export class SSLCommerzService {
  private config: SSLCommerzConfig
  private baseUrl: string

  constructor(config: SSLCommerzConfig) {
    this.config = config
    this.baseUrl = config.isLive 
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com'
  }

  async initiatePayment(paymentData: SSLCommerzPaymentData): Promise<SSLCommerzResponse> {
    const endpoint = `${this.baseUrl}/gwprocess/v4/api.php`
    
    const postData = {
      store_id: this.config.storeId,
      store_passwd: this.config.storePassword,
      total_amount: paymentData.amount.toString(),
      currency: paymentData.currency,
      tran_id: paymentData.tranId,
      success_url: paymentData.successUrl,
      fail_url: paymentData.failUrl,
      cancel_url: paymentData.cancelUrl,
      ipn_url: paymentData.ipnUrl,
      product_name: paymentData.productName,
      product_category: paymentData.productCategory,
      product_profile: 'general',
      cus_name: paymentData.customerName,
      cus_email: paymentData.customerEmail,
      cus_add1: paymentData.customerAddress,
      cus_city: paymentData.customerCity,
      cus_country: paymentData.customerCountry,
      cus_phone: paymentData.customerPhone,
      ship_name: paymentData.customerName,
      ship_add1: paymentData.customerAddress,
      ship_city: paymentData.customerCity,
      ship_country: paymentData.customerCountry,
      value_a: paymentData.donationId || '',
      value_b: paymentData.campaignId || '',
      value_c: '',
      value_d: '',
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(postData).toString(),
      })

      if (!response.ok) {
        throw new Error(`SSLCommerz API request failed: ${response.statusText}`)
      }

      const result: SSLCommerzResponse = await response.json()
      return result
    } catch (error) {
      console.error('SSLCommerz payment initiation error:', error)
      throw new Error('Payment initiation failed')
    }
  }

  async validatePayment(valId: string, tranId: string, amount: string): Promise<SSLCommerzValidationResponse> {
    const endpoint = `${this.baseUrl}/validator/api/validationserverAPI.php`
    
    const postData = {
      val_id: valId,
      store_id: this.config.storeId,
      store_passwd: this.config.storePassword,
      format: 'json'
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(postData).toString(),
      })

      if (!response.ok) {
        throw new Error(`SSLCommerz validation request failed: ${response.statusText}`)
      }

      const result: SSLCommerzValidationResponse = await response.json()
      
      // Verify the response
      if (result.status === 'VALID') {
        if (result.tran_id === tranId && parseFloat(result.amount) === parseFloat(amount)) {
          return result
        } else {
          throw new Error('Transaction validation failed: Amount or transaction ID mismatch')
        }
      } else {
        throw new Error(`Transaction validation failed: ${result.status}`)
      }
    } catch (error) {
      console.error('SSLCommerz validation error:', error)
      throw new Error('Payment validation failed')
    }
  }

  generateTransactionId(donationId: string): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    return `MOSQUE_${donationId.slice(-8)}_${timestamp}_${randomSuffix}`.toUpperCase()
  }

  verifyWebhookSignature(data: any, signature: string): boolean {
    // Implement webhook signature verification if needed
    // This depends on your SSLCommerz configuration
    return true
  }
}

// Singleton instance
let sslcommerzService: SSLCommerzService | null = null

export function getSSLCommerzService(): SSLCommerzService {
  if (!sslcommerzService) {
    const config: SSLCommerzConfig = {
      storeId: process.env.SSLCOMMERZ_STORE_ID || 'demo-store',
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || 'demo-password',
      isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true'
    }
    
    // Check if using demo credentials
    if (config.storeId === 'demo-store' || config.storeId === 'your-store-id') {
      console.warn('⚠️  Using demo SSLCommerz credentials. Please configure proper credentials for production.')
    }
    
    sslcommerzService = new SSLCommerzService(config)
  }
  
  return sslcommerzService
}
