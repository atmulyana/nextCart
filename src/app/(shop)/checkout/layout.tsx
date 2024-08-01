/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import Breadcrumb from '@/components/Breadcrumb';
import CheckoutCart from './CheckoutCart';

export default async function CheckoutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <div className='basis-full md:basis-5/6 mx-auto'>
        <Breadcrumb
            homeText={lang('Home')}
            items={[
                {
                    text: lang('Information'),
                    path: '/checkout/information'
                },
                {
                    text: lang('Shipping'),
                    path: '/checkout/shipping'
                },
                {
                    text: lang('Payment'),
                    path: '/checkout/payment'
                },
            ]}
        />
        <div className='flex flex-wrap justify-center -mx-4'>
            <div className='checkout-left-pane px-4'>{children}</div>
            <div className='checkout-right-pane px-4'>
                <CheckoutCart
                    title={lang('Cart contents')}
                    emptyText={lang('Empty cart')}
                    optionText={lang('Option')}
                    qtyText={lang('Quantity')}
                    discountText={lang('Discount')}
                    totalText={lang('Total')}
                    checkoutText={lang('Checkout')}
                    clearCartText={lang('Clear cart')}
                />
            </div>
        </div>
    </div>;
}