/** 
 * https://github.com/atmulyana/nextCart
 **/
import {
    integer,
    length,
    min,
    numeric,
    required,
} from '@react-input-validator/rules';
import productSchema from './product';
import {Schema} from '..';
import NoHtml from '../rules/NoHtml';

export default new Schema({
    title: [
        required,
        new NoHtml(),
        length(2),
    ],
    price: productSchema.shape.price,
    stock: productSchema.shape.stock,
    imageIdx: [numeric, integer, min(0)],
});