# Email Configuration Notes

## Current Setup
- **Email Service**: Resend (API Key: re_YydR4LJe_6uJFzD6bPdW2cLXNaLPdirFp)
- **Domain**: azelea.aircon.services.com
- **Current Sender**: onboarding@resend.dev (test domain)

## User's DNS Records (AWS SES - if switching later)

### DKIM
| Type | Name | Content |
|------|------|---------|
| TXT | resend._domainkey.azelea.aircon | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDWuAPw8KS5XDHH+yz5FMz7x/YT76KVijno2PcjWo0HglmXQqEK06OfXyX9zhiAgz0T2BQQA3IMedGSkrz6q4XGANKLm9e0V360H86zgEDjb0/IMqW/yN7GqM2RSoNGsoU/wSDPXWdcHJl8pEVLQUMoxxzf7xXRmt7GMiIzxAQRlQIDAQAB |

### SPF (Sending)
| Type | Name | Content | Priority |
|------|------|---------|----------|
| MX | send.azelea.aircon | feedback-smtp.ap-northeast-1.amazonses.com | 10 |
| TXT | send.azelea.aircon | v=spf1 include:amazonses.com ~all | - |

### MX (Receiving)
| Type | Name | Content | Priority |
|------|------|---------|----------|
| MX | azelea.aircon | inbound-smtp.ap-northeast-1.amazonaws.com | 10 |

## Resend Domain Setup (Pending)

When setting up Resend domain `azelea.aircon`, add:
| Type | Name | Content |
|------|------|---------|
| TXT | azelea.aircon | v=spf1 include:_spf.resend.com ~all |
| (DKIM records provided by Resend) | resend._domainkey.azelea.aircon | (provided by Resend) |

## Vercel Environment Variables
```
RESEND_API_KEY = re_YydR4LJe_6uJFzD6bPdW2cLXNaLPdirFp
NEXT_PUBLIC_FIREBASE_VAPID_KEY = BCv_5mwQFwdPkBZ3c1JUhUlpO34399eOnFDoD_kdm5rrbGpYykjn_HASLQR0h9FVBo9hxx_LEdcI1XSziIadpkE
```

## Firebase Configuration
- Project: notif-11720
- Messaging Sender ID: 659699156774
- VAPID Key: BCv_5mwQFwdPkBZ3c1JUhUlpO34399eOnFDoD_kdm5rrbGpYykjn_HASLQR0h9FVBo9hxx_LEdcI1XSziIadpkE

## Notes
- Resend free tier: 3,000 emails/month
- Firebase FCM: Free forever
- Email goes to spam with onboarding@resend.dev (test domain)
- Need to verify domain azelea.aircon in Resend to fix spam issue