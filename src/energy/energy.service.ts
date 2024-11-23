import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnergyService {
  private readonly logger = new Logger(EnergyService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TRXX_API_KEY');
    this.apiSecret = this.configService.get<string>('TRXX_API_SECRET');
    this.apiUrl = this.configService.get<string>(
      'TRXX_API_URL',
      'https://trxx.io/api/v1/frontend/order',
    );

    if (!this.apiKey || !this.apiSecret) {
      this.logger.error('TRXX API Key and Secret are required');
      throw new Error('TRXX API configuration missing');
    }
  }
  /**
   * Rent energy for a wallet address.
   * @param energyAmount - Amount of energy to rent.
   * @param receiveAddress - TRON wallet address.
   * @param callbackUrl - URL to handle callbacks.
   * @param outTradeNo - Unique identifier for the transaction.
   */
  async rentEnergy(
    energyAmount: number,
    receiveAddress: string,
    callbackUrl: string,
    outTradeNo: string,
  ): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = {
      energy_amount: energyAmount,
      period: '1H',
      receive_address: receiveAddress,
      callback_url: callbackUrl,
      out_trade_no: outTradeNo,
    };
    const sortedData = JSON.stringify(data, Object.keys(data).sort());
    const message = `${timestamp}&${sortedData}`;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    const headers = {
      'API-KEY': this.apiKey,
      TIMESTAMP: timestamp,
      SIGNATURE: signature,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(this.apiUrl, sortedData, { headers });
      this.logger.log(
        `Energy rented successfully for address: ${receiveAddress}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to rent energy: ${error.message}`);
      throw error;
    }
  }
}
