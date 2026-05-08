import type { ByteInputEncoding } from './encoding';

export interface HmacExample {
  id: string;
  label: string;
  keyEncoding: ByteInputEncoding;
  key: string;
  message: string;
  expectedHmac: string;
  source: string;
}

export const HMAC_EXAMPLES: HmacExample[] = [
  {
    id: 'rfc4231-tc1',
    label: 'RFC 4231 Test Case 1',
    keyEncoding: 'hex',
    key: '0b'.repeat(20),
    message: 'Hi There',
    expectedHmac: 'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7',
    source: 'RFC 4231 section 4.2',
  },
  {
    id: 'rfc4231-tc2',
    label: 'RFC 4231 Test Case 2',
    keyEncoding: 'text',
    key: 'Jefe',
    message: 'what do ya want for nothing?',
    expectedHmac: '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    source: 'RFC 4231 section 4.3',
  },
  {
    id: 'aws-sigv4-kdate',
    label: 'AWS SigV4 kDate',
    keyEncoding: 'text',
    key: 'AWS4wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    message: '20130524',
    expectedHmac: '68896419206d6240ad4cd7dc8ba658efbf3b43b53041950083a10833824fcfbb',
    source: 'AWS S3 Signature Version 4 signing-key example',
  },
];
