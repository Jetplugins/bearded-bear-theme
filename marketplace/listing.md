# JetBrains Marketplace Listing Configuration

## Plugin Information
- **Plugin ID**: dev.jetplugins.beardedtheme
- **Name**: Bearded Theme
- **Category**: UI Themes

## Pricing Model
- **Type**: Paid subscription
- **Monthly Price**: $1.00 USD/month
- **Annual Price**: $10.00 USD/year (2 months free)
- **Product Code**: PBEARDEDTHEME

## Marketplace Setup Instructions

### 1. Upload Plugin
Upload the built `.zip` from `build/distributions/` to https://plugins.jetbrains.com

### 2. Configure Paid Plugin
1. Go to plugin settings → Pricing
2. Select "Paid" plugin type
3. Set pricing tier:
   - Monthly: $1.00
   - Annual: $10.00
4. Keep `optional="true"` in `product-descriptor`. Marketplace payment governs access to its
   delivery channel, updates, and support; it must not restrict GPL rights in copies already received.

### 3. Product Descriptor
The `plugin.xml` contains:
```xml
<product-descriptor code="PBEARDEDTHEME" release-date="20260311" release-version="20261" optional="true"/>
```

- `code` = unique product code for licensing
- `optional="true"` = the plugin does not enforce a runtime subscription restriction
- `release-date` = date of first release (YYYYMMDD format)
- `release-version` = numeric version for license tracking

### 4. GPL rights
Do not add runtime checks or notices saying that a Marketplace subscription is required to use,
modify, or redistribute a received copy. The Marketplace may charge for delivery and support, but
the GPLv3 terms govern recipients' rights in the plugin.

### 5. Signing
Set these environment variables for plugin signing:
```bash
export CERTIFICATE_CHAIN="<your-certificate-chain>"
export PRIVATE_KEY="<your-private-key>"
export PRIVATE_KEY_PASSWORD="<your-password>"
export PUBLISH_TOKEN="<your-marketplace-token>"
```

Then run:
```bash
./gradlew signPlugin
./gradlew publishPlugin
```

## Revenue Information
JetBrains takes a 25% commission on marketplace sales:
- $1.00/month → $0.75 net per subscriber per month
- $10.00/year → $7.50 net per subscriber per year
