import { isPasswordCompliant } from './passwordHelper';

describe('isPasswordCompliant', () => {
    it('has at least one uppercase character', () => {
        expect(isPasswordCompliant('Karthic@123')).toBeTruthy();
        expect(isPasswordCompliant('karthic@123')).toBeFalsy();
    });
    it('has at least one lower character', () => {
        expect(isPasswordCompliant('Karthic@123')).toBeTruthy();
        expect(isPasswordCompliant('KARTHIC@123')).toBeFalsy();
    });
    it('has at least one digit', () => {
        expect(isPasswordCompliant('Karthic@123')).toBeTruthy();
        expect(isPasswordCompliant('KARTHIC@')).toBeFalsy();
    });
    it('has at least one of !, @, #, $, %, &, *', () => {
        expect(isPasswordCompliant('Karthic@123')).toBeTruthy();
        expect(isPasswordCompliant('KARTHIC(')).toBeFalsy();
    });
    it('has minimum 8 characters', () => {
        expect(isPasswordCompliant('Karthic@123')).toBeTruthy();
        expect(isPasswordCompliant('KARTH')).toBeFalsy();
    });
});
