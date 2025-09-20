/** 
 * https://github.com/atmulyana/nextCart
 **/
export default class BaseURL extends URL {
    static reDirSepTrimEnd = /\/+$/;
    constructor(input, base) {
        super(input, base);
        this.username = '';
        this.password = '';
        this.search = '';
        this.hash = '';
    }

    get path() {
        return super.pathname.replace(BaseURL.reDirSepTrimEnd, '');
    }

    get pathname() {
        return this.path || '/';
    }

    toString() {
        const str = super.toString();
        return str.replace(BaseURL.reDirSepTrimEnd, '');
    }

    toJSON() {
        return this.toString();
    }
}