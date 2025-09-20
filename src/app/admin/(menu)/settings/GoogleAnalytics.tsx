'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Config} from '@/config';
import CheckBox from '@/components/SubmittedCheckBox';
import CodeEditor, {javascript} from '@/components/CodeEditor';
import Input from '@/components/SubmittedInput';

export default function GoogleAnalytics({
    config,
    texts,
}: {
    config: Config['googleAnalytics'],
    texts: {
        dataLayer: string,
        script: string,
    }
}) {
    const [enabled, setEnabled] = React.useState(!!config);

    return <fieldset className='border-double border-4 rounded-lg p-2 mb-4'>
            <legend className='flex items-center px-1'>
                <CheckBox
                    noIndeterminate
                    id='settings.gaEnabled'
                    name='gaEnabled'
                    value={enabled}
                    onChange={ev => setEnabled(ev.target.value)}
                /><label
                    htmlFor='settings.gaEnabled'    
                >&nbsp;Google&nbsp;Analytics</label>
            </legend>
            {enabled && <>
            <div className='flex mb-4'>
                <label className='flex-none basis-36' htmlFor='settings.googleAnalytics.gaId'>ID</label>
                <Input
                    containerClass='flex-1'
                    id='settings.googleAnalytics.gaId'
                    name='googleAnalytics.gaId'
                    value={config?.gaId}
                />
            </div>
            <div className='flex flex-col mb-4'>
                <div className='flex'>
                    <label className='flex-none basis-36' htmlFor='settings.googleAnalytics.dataLayerName'>dataLayerName</label>
                    <Input
                        containerClass='flex-1'
                        id='settings.googleAnalytics.dataLayerName'
                        name='googleAnalytics.dataLayerName'
                        value={config?.dataLayerName}
                    />
                </div>
                {texts.dataLayer && <div className='text-gray-500 ml-36'>{texts.dataLayer}</div>}
            </div>
            <div className='flex items-center mb-4'>
                <label className='flex-none basis-36' htmlFor='settings.googleAnalytics.debugMode'>debugMode</label>
                <CheckBox
                    containerClass='justify-start'
                    id='settings.googleAnalytics.debugMode'
                    name='googleAnalytics.debugMode'
                    noIndeterminate
                    value={config?.debugMode}
                />
            </div>
            {/* <div className='flex flex-col mb-4'>
                <label>Event Script</label>
                <CodeEditor lang={javascript} name='googleAnalytics.script' rows={5} value={config?.script} />
                {texts.script && <div className='text-gray-500'>{texts.script}</div>}
            </div> */}
            </>}
        </fieldset>;
}