# Fix: Mobile Menu Not Closing When Logo is Clicked

## Issue Description
When the hamburger menu is open on mobile devices and the user clicks the "ILLUMMAA" logo, the mobile menu remains open and the page doesn't return to the hero section as expected. This behavior works correctly on desktop versions but fails on mobile.

## Root Cause
In `client/src/components/sticky-header.tsx`, the `handleLogoClick` function (lines 91-113) does not close the mobile menu when executed. Other navigation items use the `scrollToSection` function which includes `setMobileMenuOpen(false)` to close the menu, but the logo click handler is missing this functionality.

## Solution
Add `setMobileMenuOpen(false)` at the beginning of the `handleLogoClick` function to close the mobile menu before performing navigation or scrolling actions.

## Code Changes Required

**File:** `client/src/components/sticky-header.tsx`

**Location:** Lines 91-113

**Replace the current `handleLogoClick` function with:**

```typescript
const handleLogoClick = (e: React.MouseEvent) => {
  // Close mobile menu first
  setMobileMenuOpen(false);

  // Track logo click
  analytics.trackNavigation({
    action: 'logo_click',
    category: 'Navigation',
    section_name: 'Logo',
    navigation_type: 'header',
    label: 'ILLUMMAA Logo',
    custom_parameters: {
      current_location: location,
      action_type: location === "/" || location === "" ? 'scroll_to_top' : 'navigate_home'
    }
  });

  // If already on home page, scroll to top instead of navigating
  if (location === "/" || location === "") {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Navigate to home page
    navigate("/");
  }
};
```

**Key Change:** Add line 93: `setMobileMenuOpen(false);` immediately after the function declaration and before the analytics tracking.

## Testing
After applying this fix:
1. Open the website on a mobile device or mobile viewport
2. Open the hamburger menu
3. Click on the ILLUMMAA logo
4. Verify that:
   - The mobile menu closes
   - The page scrolls to the top (if already on home page)
   - The page navigates to home and scrolls to top (if on a different page)

## Expected Behavior
The mobile menu should close and the page should return to the hero section when clicking the logo, matching the desktop behavior and providing a consistent user experience across all devices.
