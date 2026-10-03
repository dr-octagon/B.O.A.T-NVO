# Third-party notices

The libraries below are bundled into provider JavaScript files or the local
Desktop catalog runtime. Their original license texts are preserved.

## CineStream extractor protocol references

The JavaScript implementation also uses protocol references from the Cloudstream
project's DoodExtractor, VidHidePro, VidStack, ByseSX and GDMirrorbot extractors:
https://github.com/recloudstream/cloudstream/tree/master/library/src/commonMain/kotlin/com/lagradost/cloudstream3/extractors

The reference project is licensed under GPL-3.0. Its license text is preserved in
`licenses/cloudstream-GPL-3.0.txt`.

## CineStream DOM dependencies

CineStream and the Desktop catalog runtime bundle Cheerio's browser-compatible slim parser because Desktop's
native shim does not implement the required parent/child DOM boundaries. The
complete license texts for Cheerio, htmlparser2, its DOM utilities, entities,
selector dependencies and boolbase are preserved in
`licenses/cinestream-cheerio-dependencies.txt`.

## Desktop catalog CryptoJS

The local catalog runtime bundles crypto-js 4.2.0 so providers can run without
installing npm dependencies. Its MIT license is preserved in
`licenses/desktop-crypto-js-LICENSE.txt`.

## @noble/ciphers 2.4.0

The MIT License (MIT)

Copyright (c) 2022 Paul Miller (https://paulmillr.com)
Copyright (c) 2016 Thomas Pornin <pornin@bolet.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## fflate 0.8.3

MIT License

Copyright (c) 2026 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
