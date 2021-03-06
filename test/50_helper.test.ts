/// <reference types="node" />
/// <reference types="mocha" />

import * as fs from 'fs';
import * as ffi from 'ffi';
import {basename, normalize} from 'path';
import * as assert from 'power-assert';
import * as Win from '../src/index';
import * as Conf from '../src/lib/conf';
import * as GT from '../src/lib/types';
import * as H from '../src/lib/helper';
import * as WD from '../src/lib/windef';
import {windefSet} from '../src/lib/conf';

const filename = basename(__filename);
const dllDir = normalize(__dirname + '/../src/lib/');
const dlls = <string[]> [];

for (let key of fs.readdirSync(dllDir)) {
    const stat = fs.statSync(normalize(dllDir + key));
    if (stat.isDirectory()) {
        dlls.push(key);
    }
}


describe(filename + ' :gen_api_opts() all', () => {
    for (let dll of dlls) {
        const apiName: string = dll.slice(0, 1).toUpperCase() + dll.slice(1).toLowerCase(); // User32, Kernel32, ...
        const module: any = Win[apiName];

        if (module && module.apiDef) {
            const api: GT.ApiDef = module.apiDef;
            let n = 0;

            for (let fn in api) {
                if (!{}.hasOwnProperty.call(api, fn)) {
                    continue;
                }
                n += 1;
            }

            it(`Should ${apiName} number of fns equal to the number of fns return by gen_api_opts`, function() {
                const fns: GT.ApiDef = H.gen_api_opts(api);
                const keysize = Object.keys(fns).length;

                assert(typeof fns === 'object' && fns, `fns return by gen_api_opts() not object`);
                assert(keysize === n, `the items of fns ${keysize} not equal to the ${n} numbers of item of the Win.${apiName}`);
            });

        }
        else {
            assert(false, 'module or module.apiDef invalie');
        }

    }
});


describe(filename + ' :parse_placeholder(ps, settings) ', () => {
    const fn = 'parse_placeholder()';

    it(`Should ${fn} handle value of ps correctly)`, function() {
        let ps: any;
        try {
            H.parse_placeholder(ps);
            assert(false, 'function should throw error with invalid value of ps, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

});

describe(filename + ' :parse_param_placeholder(param, settings?) ', () => {
    const fn = 'parse_param_placeholder';

    it(`Should ${fn} handle value of settings correctly)`, function() {
        const st = <GT.LoadSettings> {...Conf.settingsDefault};
        try {
            let p: any;
            H.parse_param_placeholder(p, st);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

   it(`Should ${fn} handle value of param correctly)`, function() {
       const st = <GT.LoadSettings> {...Conf.settingsDefault};
       try {
           const p: GT.MacroDef = ['invalid_placeholder', 'int64', 'int32'];
           H.parse_param_placeholder(p, st);
           assert(false, 'should throw Error by invalid param, but not');
       }
       catch (ex) {
           assert(true);
       }
   });

   it(`Should ${fn} handle value of settings for arch of nodejs correctly)`, function() {
       const p1 = 'debug_int64';
       const p2 = 'debug_int32';
       const p: GT.MacroDef = [Conf._WIN64_HOLDER, p1, p2];
       const st = {...Conf.settingsDefault};
       const str1 = H.parse_param_placeholder(p, {...st, _WIN64: true});
       assert(str1 === p1, `result should be "${p1}", got ${str1}`);

       const str2 = H.parse_param_placeholder(p, {...st, _WIN64: false});
       assert(str2 === p2, `result should be "${p2}", got ${str2}`);
   });

   it(`Should ${fn} handle value of settings for ANSI/UNICODE correctly)`, function() {
       const LPTSTR: GT.MacroDef = [Conf._UNICODE_HOLDER, WD.LPWSTR, 'uint8*'];
       const st = {...Conf.settingsDefault};
       const str1 = H.parse_param_placeholder(LPTSTR, {...st, _UNICODE: true});
       assert(str1 === LPTSTR[1], `result should be "${LPTSTR[1]}", got ${str1}`);

       const str2 = H.parse_param_placeholder(LPTSTR, {...st, _UNICODE: false});
       assert(str2 === LPTSTR[2], `result should be "${LPTSTR[2]}", got ${str2}`);
   });

});

// not used
function test_settings(fn: string, settings: GT.LoadSettings): void {
    const st = {...settings};
    const str: GT.FFIParam = H.parse_param_placeholder('int32', st);
    console.log('ssss', st);
    process.exit();

    it(`Should ${fn} handle value of settings correctly)`, function() {
        assert(st && typeof st._UNICODE !== 'undefined', 'st._UNICODE should not be undefined');
        assert(st && typeof st._WIN64 !== 'undefined', 'st._WIN64  should not be undefined');
        assert(st && st._UNICODE === true, 'st._UNICODE is false');
        assert(st && st._WIN64 === (process.arch === 'x64' ? true : false), 'st._WIN64 not match process.arch');
    });
}

describe(filename + ' :parse_placeholder_arch(param, _WIN64)', () => {
    const fn = 'parse_placeholder_arch';

    it(`Should ${fn} handle value of param correctly)`, function() {
        let p: any = 'test';
        const res = H[fn](p, true);
        assert(res === p, 'should ${p} got ${res}');
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any;
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any = [1, 2];    // should 3 items
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

});

describe(filename + ' :parse_placeholder_unicode(param, _WIN64)', () => {
    const fn = 'parse_placeholder_unicode';

    it(`Should ${fn} handle value of param correctly)`, function() {
        let p: any = 'test';
        const res = H[fn](p, true);
        assert(res === p, 'should ${p} got ${res}');
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any;
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

    it(`Should ${fn} handle value of param correctly)`, function() {
        try {
            let p: any = [1, 2];    // should 3 items
            H[fn](p, true);
            assert(false, 'should throw Error by invalid param, but not');
        }
        catch (ex) {
            assert(true);
        }
    });

});

describe(filename + ' :parse_windef()', () => {
    const fn = 'parse_windef';
    const fake = 'fake';

    it(`Should ${fn} process windef with fake windef correctly)`, function() {
        const W = {...WD};

        Object.defineProperty(WD, fake, {
            configurable: true,
            writable: true,
            enumerable: true,
            value: 777, // should string or string[]
        });
        try {
            H.parse_windef(W);
            assert(false, 'should throw Error, but none');
        }
        catch (ex) {
            assert(true);
        }

        Object.getOwnPropertyNames(W).forEach((val, idx) => {
            if (val === fake) {
                W[val] = 'int';
            }
        });
        Object.defineProperty(W, 777, { // should string
            configurable: true,
            writable: true,
            enumerable: true,
            value: 'int',
        });
        try {
            H.parse_windef(W);
            assert(false, 'should throw Error, but none');
        }
        catch (ex) {
            Object.defineProperty(W, 777, { // should string
                enumerable: false,
            });
            assert(true);
        }
    });

    it(`Should ${fn} process windef macro members correctly)`, function() {
        const W = <GT.Windef> {};
        const keyArch = '__testKeyArch';
        const v64 = '_v64';
        const v32 = '_v32';

        W[keyArch] = Conf._WIN64_HOLDER;
        W.macroMap = <GT.MacroMap> new Map([
            [keyArch, [Conf._WIN64_HOLDER, v64, v32]],
        ]);

        let _WIN64 = true;
        let windata = H.parse_windef(W, {...Conf.settingsDefault, _windefClone: true, _WIN64});
        assert(windata[keyArch] === v64, `should "${v64}", got "${v32}" under ${_WIN64 ? 'x64' : 'ia32'}`);

        _WIN64 = false;
        windata = H.parse_windef(W, {...Conf.settingsDefault, _windefClone: true, _WIN64});
        assert(windata[keyArch] === v32, `should "${v32}", got "${v64}" under ${_WIN64 ? 'x64' : 'ia32'}`);

        const keyUni = '__testKeyUNI';
        const uni = '_valueUNICODE';
        const ansi = '_valueANSI';

        delete W[keyArch];
        W[keyUni] = Conf._UNICODE_HOLDER;
        W.macroMap = <GT.MacroMap> new Map([
            [keyUni, [Conf._UNICODE_HOLDER, uni, ansi]],
        ]);

        let _UNICODE = true;
        let windata2 = H.parse_windef(W, {...Conf.settingsDefault, _windefClone: true, _UNICODE});
        assert(windata2[keyUni] === uni, `should "${uni}", got "${ansi}" under ${_UNICODE ? 'UNICODE' : 'ANSI'}`);

        _UNICODE = false;
        windata2 = H.parse_windef(W, {...Conf.settingsDefault, _windefClone: true, _UNICODE});
        assert(windata2[keyUni] === ansi, `should "${ansi}", got "${uni}" under ${_UNICODE ? 'UNICODE' : 'ANSI'}`);

    });

    // at lastest
    it(`Should ${fn} process windef correctly)`, function() {
        const W = {...WD};
        const windata = H.parse_windef(W, {...Conf.settingsDefault, _windefClone: true});
        const lenData = Object.keys(windata).length + Conf.windefSkipKeys.size;
        const lenDef = Object.keys(W).length;
        assert(lenData === lenDef, `lenData:${lenData}, lenDef:${lenDef} not equal `);
    });

});

