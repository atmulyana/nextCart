/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyString} from 'javascript-common';
import config from '@/config';
import lang from '@/data/lang';
import {currencySymbol, fnMeta} from '@/lib/common';
import gatewayNames from '@/lib/payments/gateway-names';
import type {Config} from '@/lib/payments/types';
import Button from '@/components/SubmitButton';
import CheckBox from '@/components/SubmittedCheckBox';
import CodeEditor, {css, html, javascript} from '@/components/CodeEditor';
import Form from '@/components/FormWithSchema';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';
import Template from '@/components/partials/Template';
import {save} from './actions';
import EmailTestButton from './EmailTestButton';
import GoogleAnalytics from './GoogleAnalytics';
import Payment from './Payment';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Cart settings')}`,
    };
});

export default async function UpdateSettings() {
    const gateways: Array<{value: string, label: string}> = [];
    for (let value of gatewayNames) {
        const gwCfg = (await import(/* webpackMode: "eager" */`@/lib/payments/${value}/config`)).default as Config;
        gateways.push({value, label: gwCfg.description});
    }

    return <Template>
        <Form action={save} schemaName='settings' className='block'>
            <div className='flex items-baseline pb-5'>
                <h2 className='flex-auto'>{lang('General settings')}</h2>
                <Button className='btn-outline-success ml-4'>{lang('Save')}</Button>
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='settings.cartTitle'>{lang('Cart name')}</label>
                <Input name='cartTitle' id='settings.cartTitle' type='text' value={config.cartTitle} />
                <div className='text-gray-500'>{lang('This element is critical for search engine optimisation. Cart title is displayed if your logo is hidden.')}</div>
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='settings.cartDescription'>{lang('Cart description')}</label>
                <Input name='cartDescription' id='settings.cartDescription' type='text' value={config.cartDescription} />
                <div className='text-gray-500'>{lang('This description shows when your website is listed in search engine results.')}</div>
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='settings.cartLogo'>{lang('Cart image/logo')}</label>
                <Input name='cartLogo' id='settings.cartLogo' type='text' value={config.cartLogo} />
                <div className='text-gray-500'>{lang('The URL of cart image/logo')}</div>
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='settings.baseUrl'>{lang('Cart URL')}</label>
                <Input name='baseUrl' id='settings.baseUrl' type='text' value={config.baseUrl.toString()} />
                <div className='text-gray-500'>{lang('This URL is used in sitemaps and when your customer returns from completing their payment. Also used for web site metadata and email.')}</div>
            </div>
            
            <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
                <legend className='px-1'>{lang('Language')}</legend>

                <div className='flex flex-wrap -mx-2'>
                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='settings.enableLanguages'>{lang('Show language menu')}</label>
                            <CheckBox
                                name="enableLanguages"
                                id="settings.enableLanguages"
                                noIndeterminate
                                value={config.enableLanguages}
                            />
                        </div>
                        <div className='text-gray-500'>{lang('The menu contains the choice of languages that the user/customer can choose')}</div>
                    </div>

                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label htmlFor='settings.defaultLocale'>{lang('Default language')}</label>
                        <Select name='defaultLocale' id='settings.defaultLocale' value={config.defaultLocale}>
                            {Object.keys(config.availableLanguages).map(
                                locale => <option key={locale} value={locale}>{config.availableLanguages[locale]}</option>
                            )}
                        </Select>
                        <div className='text-gray-500'>{lang("The default language if the user/customer opens the application for the first time or hasn't chosen a language yet from the menu")}</div>
                    </div>
                </div>

                <div className='text-gray-500 mb-4'>{lang('To set up the available languages, please edit "src/config/usable-on-client.json" on field "availableLanguages". Also, you must set the translation of the new languages in "src/data/lang/data.sqlite". After that, please rebuild.')}</div>
            </fieldset>

            <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
                <legend className='px-1'>{lang('Payment')}</legend>
                <Payment
                    currencyISO={config.currencyISO}
                    currencySymbol={currencySymbol()}
                    gatewayOptions={gateways}
                    seletedGateways={config.paymentGateway}
                    texts={{
                        currencyISO: lang('Currency ISO code'),
                        currencyISODesc: lang('Currency used for Blockonomics conversion'),
                        currencySymbol: lang('Currency symbol'),
                        currencySymbolDesc: lang('Set this to your currency symbol. Eg: $, £, €'),
                        method: lang('Method'),
                    }}
                />
            </fieldset>
            
            <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
                <legend className='px-1'>{lang('Products')}</legend>

                <div className='flex flex-wrap -mx-2'>
                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label htmlFor='settings.productsPerRow'>{lang('Products per row')}</label>
                        <Select name='productsPerRow' id='settings.productsPerRow' value={config.productsPerRow.toString()}>
                            <option value='1'>1</option>
                            <option value='2'>2</option>
                            <option value='3'>3</option>
                            <option value='4'>4</option>
                        </Select>
                        <div className='text-gray-500'>{lang('The number of products to be displayed across the page.')}</div>
                    </div>

                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label htmlFor='settings.productsPerPage'>{lang('Products per page')}</label>
                        <Input name='productsPerPage' id='settings.productsPerPage' type='number' value={config.productsPerPage} />
                        <div className='text-gray-500'>{lang('The number of products to be displayed on each page.')}</div>
                    </div>
                </div>

                <div className='flex flex-wrap -mx-2'>
                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label htmlFor='settings.productOrderBy'>{lang('Product Order By')}</label>
                        <Select name='productOrderBy' id='settings.productOrderBy' value={config.productOrderBy}>
                            <option value='date'>{lang('Created date')}</option>
                            <option value='title'>{lang('Title', 1)}</option>
                        </Select>
                        <div className='text-gray-500'>{lang('Select the field by which the product should be sorted when displayed in store.')}</div>
                    </div>

                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label htmlFor='settings.productOrder'>{lang('Product Order')}</label>
                        <Select name='productOrder' id='settings.productOrder' value={config.productOrder}>
                            <option value='ascending'>{lang('Ascending')}</option>
                            <option value='descending'>{lang('Descending')}</option>
                        </Select>
                        <div className='text-gray-500'>{lang('Select the order in which the products should be sorted.')}</div>
                    </div>
                </div>

                <div className='flex flex-wrap -mx-2'>
                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='settings.showHomepageVariants'>{lang('Show variants at homepage')}</label>
                            <CheckBox
                                name="showHomepageVariants"
                                id="settings.showHomepageVariants"
                                noIndeterminate
                                value={config.showHomepageVariants}
                            />
                        </div>
                        <div className='text-gray-500'>{lang('Whether to show product variant option in the product list at homepage')}</div>
                    </div>

                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='settings.showRelatedProducts'>{lang('Show related products')}</label>
                            <CheckBox
                                name="showRelatedProducts"
                                id="settings.showRelatedProducts"
                                noIndeterminate
                                value={config.showRelatedProducts}
                            />
                        </div>
                        <div className='text-gray-500'>{lang('Whether to show related products in the product page')}</div>
                    </div>
                </div>

                <div className='flex flex-wrap -mx-2'>
                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label htmlFor='settings.maxQuantity'>{lang('Max order quantity')}</label>
                        <Input name='maxQuantity' id='settings.maxQuantity' type='number' value={config.maxQuantity} />
                        <div className='text-gray-500'>{lang('The maximum quantity of an item that a customer can buy (0 means unlimited)')}</div>
                    </div>
                    <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                        <label>&nbsp;</label>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='settings.trackStock'>{lang('Stock tracking')}</label>
                            <CheckBox
                                name="trackStock"
                                id="settings.trackStock"
                                noIndeterminate
                                value={config.trackStock}
                            />
                        </div>
                        <div className='text-gray-500'>{lang('If checked, the stock count of a product will be updated in every transaction. A customer cannot buy more than the available stock.')}</div>
                    </div>
                </div>
            </fieldset>

            <div className='flex flex-col mb-4'>
                <label htmlFor='settings.itemsPerPage'>{lang('Item count per page')}</label>
                <Input name='itemsPerPage' id='settings.itemsPerPage' type='number' value={config.itemsPerPage} />
                <div className='text-gray-500'>{lang('The count of items per page in the lists at admin pages. For example, the list of products, orders etc.')}</div>
            </div>
            
            <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
                <legend className='px-1'>HTML</legend>
            
                <div className='flex flex-col mb-4'>
                    <label>{lang('Footer HTML')}</label>
                    <CodeEditor lang={html} name='footer.html' rows={10} value={config.footer.html ?? emptyString} />
                    <div className='flex fles-wrap gap-x-4 items-center'>
                        <div className='flex gap-x-1 items-center flex-none mt-0.5'>
                            <CheckBox noIndeterminate
                                name='footer.shownForCustomer'
                                id='settings.footer.shownForCustomer'
                                value={config.footer.shownForCustomer}
                            />
                            <label htmlFor='settings.footer.shownForCustomer' className='whitespace-nowrap'>
                                {lang('Shown for Customer')}
                            </label>
                        </div>
                        <div className='flex gap-x-1 items-center flex-none mt-0.5'>
                            <CheckBox noIndeterminate
                                name='footer.shownForAdmin'
                                id='settings.footer.shownForAdmin'
                                value={config.footer.shownForAdmin}
                            />
                            <label htmlFor='settings.footer.shownForAdmin' className='whitespace-nowrap'>
                                {lang('Shown for Admin')}
                            </label>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col mb-4'>
                    <label>{lang('Custom CSS')}</label>
                    <CodeEditor lang={css} name='customCss' rows={10} value={config.customCss} />
                </div>
            </fieldset>
            
            <GoogleAnalytics
                config={config.googleAnalytics}
                texts={{
                    dataLayer: lang('Javascript variable name which stores Google Analytics data. The default name (if not filled) is `dataLayer`.'),
                    script: lang(''),
                }}
            />

            <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
                <legend className='px-1'>{lang('Email')}</legend>
            
                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.email.fromAddress'>{lang('Cart Email')}</label>
                    <Input name='email.fromAddress' id='settings.email.fromAddress' type='text' value={config.email.fromAddress} />
                    <div className='text-gray-500'>{lang('This is used as the "from" email when sending receipts to your customers')}</div>
                </div>

                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.email.host'>{lang('SMTP Host')}</label>
                    <Input name='email.host' id='settings.email.host' type='text' value={config.email.host} />
                </div>

                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.email.port'>{lang('SMTP Port')}</label>
                    <Input name='email.port' id='settings.email.port' type='text' value={config.email.port.toString()} />
                </div>

                <div className='flex flex-col mb-4'>
                    <div className='flex items-center gap-2'>
                        <label htmlFor='settings.email.secure'>{lang('SMTP secure')}</label>
                        <CheckBox
                            name="email.secure"
                            id="settings.email.secure"
                            noIndeterminate
                            value={config.email.secure}
                        />
                    </div>
                </div>

                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.email.user'>{lang('SMTP Username')}</label>
                    <Input name='email.user' id='settings.email.user' type='text' value={config.email.user} />
                </div>

                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.email.password'>{lang('SMTP Password')}</label>
                    <Input name='email.password' id='settings.email.password' type='text' value={config.email.password} />
                </div>
                
                <div className='mb-4'>
                    <EmailTestButton label={lang('Send test email')} />
                </div>
            </fieldset>

            <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
                <legend className='px-1'>{lang('Session')}</legend>
            
                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.session.paramName'>{lang('Cookie name')}</label>
                    <Input name='session.paramName' id='settings.session.paramName' type='text' value={config.session.paramName} />
                    <div className='text-gray-500'>{lang('This is the name of browser cookie which stores the user/customer credential')}</div>
                </div>

                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.session.maxAge'>{lang('Expires after')}</label>
                    <div className='flex gap-2'>
                        <Input 
                            containerClass='w-64'
                            name='session.maxAge'
                            id='settings.session.maxAge'
                            type='text'
                            value={typeof(config.session.maxAge) == 'number' ? config.session.maxAge/60 + emptyString : emptyString}
                        />
                        <label>{lang('minutes')}</label>
                    </div>
                    <div className='text-gray-500'>{lang('How long the session will expire if there is no request during that period. The default value (if not filled) is 30 days.')}</div>
                </div>

                <div className='flex flex-col mb-4'>
                    <label htmlFor='settings.session.secret'>{lang('Secret key')}</label>
                    <Input name='session.secret' id='settings.session.secret' type='text' value={config.session.secret} />
                    <div className='text-gray-500'>{lang('The key to encrypt the browser cookie value which stores the credential of the user/customer')}</div>
                </div>
            </fieldset>
        </Form>
    </Template>;
}