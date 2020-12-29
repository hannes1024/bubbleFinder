"use strict";
const INT_MAX = 2147483647;
const INT_MIN = -2147483648;
const MBIG = INT_MAX;
const MSEED = 161803398;
class CSRandom {
    constructor(Seed) {
        this.SeedArray = [];
        let ii;
        let mj, mk;
        let subtraction = (Seed == INT_MIN) ? INT_MAX : Math.abs(Seed);
        mj = MSEED - subtraction;
        this.SeedArray[55] = mj;
        mk = 1;
        for (let i = 1; i < 55; i++) {
            ii = (21 * i) % 55;
            this.SeedArray[ii] = mk;
            mk = mj - mk;
            if (mk < 0) {
                mk += MBIG;
            }
            mj = this.SeedArray[ii];
        }
        for (let k = 1; k < 5; k++) {
            for (let i = 0; i < 56; i++) {
                this.SeedArray[i] -= this.SeedArray[1 + (i + 30) % 55];
                if (this.SeedArray[i] < 0) {
                    this.SeedArray[i] += MBIG;
                }
            }
        }
        this.inext = 0;
        this.inextp = 21;
        Seed = 1;
    }
    Sample() {
        return (this.InternalSample() * (1.0 / MBIG));
    }
    InternalSample() {
        let retVal;
        let locINext = this.inext;
        let locINextp = this.inextp;
        locINext++;
        if (locINext >= 56) {
            locINext = 1;
        }
        locINextp++;
        if (locINextp >= 56) {
            locINextp = 1;
        }
        retVal = this.SeedArray[locINext] - this.SeedArray[locINextp];
        if (retVal == MBIG) {
            retVal--;
        }
        if (retVal < 0) {
            retVal += MBIG;
        }
        this.SeedArray[locINext] = retVal;
        this.inext = locINext;
        this.inextp = locINextp;
        return Math.floor(retVal);
    }
    Next(a, b) {
        if (b !== undefined) {
            let maxValue = b;
            let minValue = a == undefined ? 0 : a;
            if (maxValue < minValue) {
                throw "Argument out of range";
            }
            let range = maxValue - minValue;
            if (range <= INT_MAX) {
                return Math.floor(this.Sample() * range + minValue);
            }
            else {
                return Math.floor(this.GetSampleForLargeRange() * range + minValue);
            }
        }
        else if (a !== undefined) {
            let maxValue = a;
            if (maxValue < 0) {
                throw "Argument out of range";
            }
            return Math.floor(this.Sample() * maxValue);
        }
        else {
            return this.InternalSample();
        }
    }
    NextDouble() {
        return this.Sample();
    }
    GetSampleForLargeRange() {
        let result = this.InternalSample();
        let negative = this.InternalSample() % 2 == 0;
        if (negative) {
            result = -result;
        }
        let d = result;
        d += INT_MAX - 1;
        d /= 2 * INT_MAX - 1;
        return d;
    }
}