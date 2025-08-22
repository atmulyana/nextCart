/** 
 * https://github.com/atmulyana/nextCart
 **/
import Template from '@/components/partials/Template';
import {getCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {getRequestUrl, redirectWithMessage} from '@/lib/auth';

export default async function CheckoutTemplate({children}: {children: React.ReactNode}) {
    /**
     * All these checkings have been done in "@/lib/access" (middleware)
     * We repeat them here because there is a possibility that the customer is deleted by admin while
     * s/he still navigates the checkout pages.
     */
    const cart = await getCart();
    if (!cart || Object.keys(cart.items).length < 1) {
        return await redirectWithMessage(
            '/',
            {
                message: 'There are no items in your cart. Please add some items before checking out.',
                type: 'danger',
                counter: 2,
            },
            true
        );
    }
    
    const reqUrl = await getRequestUrl();
    if (['/checkout/shipping', '/checkout/payment'].includes(reqUrl.path)) {
        const session = await getSession();
        if (!session.customerId && !session.customerEmail) {
            return await redirectWithMessage(
                '/checkout/information',
                {
                    message: 'Please fill the customer information for shipping',
                    type: 'danger',
                    counter: 2,
                },
                true
            );
        }
    }

    return <Template>
        {children}
    </Template>;
}
