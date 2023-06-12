import { PrismaClient, WebsocketSession } from '@prisma/client';
import { TransactionRecordService } from '../database/transaction-record-service.database.service.js';
import { ShopifyResolveResponse, getRecordServiceForTransaction } from '../database/record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import {
    verifyRecordWithHeliusTranscation,
    verifyTransactionWithRecord,
} from '../transaction-validation/validate-discovered-payment-transaction.service.js';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import * as web3 from '@solana/web3.js';
import { delay } from '../../utilities/delay.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { sendWebsocketMessage } from '../websocket/send-websocket-message.service.js';
import axios from 'axios';

export const processTransaction = async (
    heliusTransaction: HeliusEnhancedTransaction,
    prisma: PrismaClient,
    websocketSessions: WebsocketSession[],
    axiosInstance: typeof axios
) => {
    const transactionRecordService = new TransactionRecordService(prisma);

    const transactionRecord = await transactionRecordService.getTransactionRecord({
        signature: heliusTransaction.signature,
    });

    if (transactionRecord == null) {
        throw new Error('Transaction record not found');
    }

    const recordService = await getRecordServiceForTransaction(transactionRecord, prisma);

    const record = await recordService.getRecord(transactionRecord);

    if (record == null) {
        throw new Error('Record not found');
    }

    verifyRecordWithHeliusTranscation(record, heliusTransaction, true);

    let rpcTransaction: web3.Transaction | null = null;

    while (rpcTransaction == null) {
        try {
            await delay(3000);
            rpcTransaction = await fetchTransaction(heliusTransaction.signature);
        } catch (error) {}
    }

    verifyTransactionWithRecord(record, rpcTransaction, true);

    await recordService.updateRecordToPaid(record.id, heliusTransaction.signature);

    let resolveResponse: ShopifyResolveResponse;

    try {
        resolveResponse = await recordService.resolveSession(record, axiosInstance);
    } catch (error) {
        await recordService.sendResolveRetry(record);
        throw error;
    }

    await recordService.updateRecordToCompleted(record.id, resolveResponse);

    for (const websocketSession of websocketSessions) {
        try {
            await sendWebsocketMessage(websocketSession.connectionId, {
                messageType: 'completedDetails',
                completedDetails: {
                    redirectUrl: 'https://www.google.com',
                },
            });
        } catch (error) {
            // prob just closed and orphaned
            continue;
        }
    }
};