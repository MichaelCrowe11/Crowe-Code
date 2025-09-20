# 🌐 DNS Configuration for crowecode.com (Namecheap)

## Current Setup
Your domain `crowecode.com` is currently configured with:
- CNAME: www → parkingpage.namecheap.com
- URL Redirect: @ → http://www.crowecode.com/

## Required DNS Changes for Deployment

### Option 1: Direct VPS Deployment (Recommended)

Once you have your VPS IP address, update your Namecheap DNS:

1. **Remove existing records:**
   - Delete the CNAME record for www
   - Delete the URL Redirect record

2. **Add new A Records:**
   ```
   Type: A Record
   Host: @
   Value: YOUR_VPS_IP_ADDRESS
   TTL: Automatic
   
   Type: A Record  
   Host: www
   Value: YOUR_VPS_IP_ADDRESS
   TTL: Automatic
   ```

3. **Optional - Add wildcard for subdomains:**
   ```
   Type: A Record
   Host: *
   Value: YOUR_VPS_IP_ADDRESS
   TTL: Automatic
   ```

### Option 2: Vercel Deployment

For Vercel deployment, you'll need:

1. **Remove existing records**

2. **Add Vercel records:**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com.
   TTL: Automatic
   ```

### Option 3: Cloudflare (For CDN & DDoS Protection)

1. **Change nameservers in Namecheap to Cloudflare:**
   - Sign up for Cloudflare (free)
   - Add crowecode.com
   - Update nameservers in Namecheap to Cloudflare's

2. **In Cloudflare, add:**
   ```
   Type: A
   Name: crowecode.com
   Content: YOUR_VPS_IP
   Proxy: ON (orange cloud)
   
   Type: CNAME
   Name: www
   Content: crowecode.com
   Proxy: ON
   ```

## Email Configuration (Keep Working)

Your SPF record is already configured:
```
TXT @ "v=spf1 include:spf.efwd.registrar-servers.com ~all"
```

This will continue to work with your email forwarding.

## SSL Certificate

### For VPS Deployment:
SSL will be automatically configured using Let's Encrypt when you run the deployment script.

### For Vercel:
SSL is automatic and free.

## Testing DNS Propagation

After making changes, test propagation:

```bash
# Check A records
nslookup crowecode.com

# Check from different DNS servers
nslookup crowecode.com 8.8.8.8

# Check DNS propagation globally
# Visit: https://www.whatsmydns.net/#A/crowecode.com
```

## Quick Setup Steps

1. **Get your VPS** (DigitalOcean, Linode, AWS, etc.)
2. **Note the IP address**
3. **In Namecheap:**
   - Go to Domain List → Manage → Advanced DNS
   - Remove CNAME and URL Redirect
   - Add A Records for @ and www pointing to your VPS IP
4. **Wait 5-30 minutes for propagation**
5. **Run deployment script on VPS**

## Subdomains for Services

You might want to set up:
- `api.crowecode.com` - For API endpoints
- `app.crowecode.com` - For the main application
- `docs.crowecode.com` - For documentation
- `git.crowecode.com` - For Git server

Add as A records pointing to your VPS IP.

## Important Notes

- DNS changes can take 5 minutes to 48 hours to propagate (usually under 30 minutes)
- Keep TTL low (30 min) during setup for faster changes
- Once stable, increase TTL to 1 hour or more for better performance
- Always keep a backup of your DNS settings before making changes

## Ready to Deploy!

Once DNS is configured, you can deploy with:
```bash
./deploy-full-stack.sh crowecode.com
```