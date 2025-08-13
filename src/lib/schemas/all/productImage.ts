/** 
 * https://github.com/atmulyana/nextCart
 **/
import {required} from '@react-input-validator/rules';
import {fileType, fileMax} from '@react-input-validator/rules-file';
import {Schema} from '..';

export const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
];

export default new Schema({
    image: [
        required,
        fileType(allowedImageTypes),
        fileMax(1, 'M'),
    ],
});