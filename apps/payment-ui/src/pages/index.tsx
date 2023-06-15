import Head from 'next/head';
import MainSection from '../components/MainSection';
import DisplaySection from '../components/DisplaySection';
import { PaymentView } from '@/components/PaymentView';
import PayWithWalletSection from '@/components/PayWithWalletSection';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import PayWithQRCodeSection from '@/components/PayWithQRCodeSection';
import { useSelector } from 'react-redux';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;

    return {
        props: query,
    };
};

export type BlockedProps = {
    isBlocked: string;
    country: string;
};

export default function Home({ isBlocked, country }: BlockedProps) {

    const paymentMethod = useSelector(getPaymentMethod)

    return (
        <React.Fragment>
            <div className="flex flex-col h-screen bg-black">
                <div className="w-full max-w-xl mx-auto">
                    <div className="container mx-auto">
                        <div className="block h-16 py-2 font-black text-white text-2xl max-w-xl">
                            <DisplaySection />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-auto bg-black">
                    <div className="flex-grow container mx-auto p-4 bg-white rounded-t-lg max-w-xl">
                        <MainSection isBlocked={'false'} country={'usa'} />
                    </div>
                </div>
                <div className="w-full bg-black">
                    <div className="container h-24 mx-auto px-8 bg-white text-white text-center max-w-xl">
                        { paymentMethod == 'connect-wallet' ? <PayWithWalletSection /> : <div></div> }
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
