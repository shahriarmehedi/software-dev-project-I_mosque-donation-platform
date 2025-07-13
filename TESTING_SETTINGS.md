# Testing Dynamic Settings

## How to Test Settings Reflection

1. **Access the Admin Panel:**

   - Go to: http://localhost:3000/admin
   - Login with: admin@mosque.org / admin123

2. **Update Settings:**

   - Navigate to Settings page
   - Change mosque name, colors, or other settings
   - Save the changes

3. **Verify Changes on Homepage:**
   - Go back to: http://localhost:3000
   - Refresh the page (or open in a new tab)
   - Verify that all changes are reflected:
     - Mosque name in header and footer
     - Primary/secondary colors in buttons and elements
     - Contact information
     - Social media links
     - Minimum donation amounts
     - Default preset amounts

## API Endpoints

- **Public Settings API:** GET /api/settings

  - Returns public settings for homepage
  - No authentication required

- **Admin Settings API:**
  - GET /api/admin/settings (requires admin auth)
  - PUT /api/admin/settings (requires admin auth)

## Key Features

✅ **Real-time Settings Reflection:**

- Homepage fetches settings on every load
- Settings API returns fresh data from database
- No hardcoded values anywhere

✅ **Dynamic UI Elements:**

- Mosque name in header/footer
- Primary/secondary colors for buttons
- Contact info display
- Social media links
- Donation amount presets
- Minimum donation validation

✅ **Settings Persistence:**

- All settings stored in MongoDB
- Updated via admin panel
- Immediately reflected on frontend

## Database Schema

The SiteSettings model includes:

- Basic info (name, description, contact)
- Payment settings (minimum amounts, defaults)
- Appearance (colors, logo, banner)
- Social media links
- Donation configurations
