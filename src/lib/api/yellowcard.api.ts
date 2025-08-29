import { yellowCardService } from '@/lib/services/yellowcard.service';

export const yellowCardAPI = {
  async getExchangeRate(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const fromCurrency = searchParams.get('from') || 'USD';
      const toCurrency = searchParams.get('to') || 'USDC';
      
      const rate = await yellowCardService.getExchangeRate(fromCurrency, toCurrency);
      
      return new Response(JSON.stringify({ rate }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ 
        error: error.message || 'Failed to get exchange rate' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
