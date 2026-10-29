import { FormSample } from '../types';

export const SAMPLES: FormSample[] = [
  {
    id: 'flawed-registration',
    title: 'The "Oops" Registration Form',
    tagline: 'Packed with 4 classic real-world HTML validation bugs!',
    badge: '💥 Deliberately Broken',
    html: `<form id="signup-form" action="/register" method="POST" class="form-container">
  <h2>Create Account</h2>

  <!-- BUG 1: Email field using type="text" instead of type="email" -->
  <div class="form-group">
    <label for="email">Email Address *</label>
    <input 
      type="text" 
      id="email" 
      name="email" 
      placeholder="you@domain.com"
      required 
    />
    <small>Must be a valid email (or so we thought...)</small>
  </div>

  <!-- BUG 2: Contradictory constraints: minlength (8) is greater than maxlength (6)! -->
  <div class="form-group">
    <label for="password">Password *</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      minlength="8" 
      maxlength="6" 
      required 
    />
    <small>Needs at least 8 characters, but caps at 6!</small>
  </div>

  <!-- BUG 3: Inverted numeric range: min="21" is greater than max="18" -->
  <div class="form-group">
    <label for="age">Age Verification</label>
    <input 
      type="number" 
      id="age" 
      name="age" 
      min="21" 
      max="18" 
      placeholder="21+"
    />
    <small>Between 21 and 18 years old?</small>
  </div>

  <!-- BUG 4: Missing 'name' attribute - this input will never be submitted to the server! -->
  <div class="form-group">
    <label for="promo">Promo Code</label>
    <input 
      type="text" 
      id="promo" 
      placeholder="SUMMER2026" 
      pattern="[A-Z0-9]{4,10}"
    />
    <small>Missing the name attribute</small>
  </div>

  <!-- SURVIVOR: Properly configured username field -->
  <div class="form-group">
    <label for="username">Username *</label>
    <input 
      type="text" 
      id="username" 
      name="username" 
      minlength="3" 
      maxlength="20" 
      pattern="[a-zA-Z0-9_]+" 
      required 
    />
  </div>

  <!-- SURVIVOR: Required consent checkbox -->
  <div class="form-group checkbox-group">
    <label>
      <input type="checkbox" name="terms" id="terms" required />
      I accept the Terms & Conditions *
    </label>
  </div>

  <button type="submit" class="submit-btn">Join Now</button>
</form>`,
  },
  {
    id: 'bulletproof-profile',
    title: 'The Bulletproof Profile Form',
    tagline: 'All constraints aligned with HTML5 standards and WCAG labels.',
    badge: '🛡️ Form Fortress',
    html: `<form id="profile-form" action="/profile/update" method="POST">
  <h2>User Profile</h2>

  <div class="form-group">
    <label for="user-email">Email Address *</label>
    <input 
      type="email" 
      id="user-email" 
      name="email" 
      placeholder="alex@example.com" 
      required 
    />
  </div>

  <div class="form-group">
    <label for="user-age">Age (18-120) *</label>
    <input 
      type="number" 
      id="user-age" 
      name="age" 
      min="18" 
      max="120" 
      required 
    />
  </div>

  <div class="form-group">
    <label for="website">Portfolio URL</label>
    <input 
      type="url" 
      id="website" 
      name="website" 
      placeholder="https://example.com" 
    />
  </div>

  <div class="form-group">
    <label for="bio">Short Bio (max 160 chars)</label>
    <textarea 
      id="bio" 
      name="bio" 
      maxlength="160"
      rows="3"
    ></textarea>
  </div>

  <button type="submit">Save Profile</button>
</form>`,
  },
  {
    id: 'quirky-checkout',
    title: 'The Quirky Checkout',
    tagline: 'Broken ZIP pattern and unconstrained quantities.',
    badge: '🛒 Cart Chaos',
    html: `<form id="checkout-form" action="/checkout" method="POST">
  <h2>Quick Checkout</h2>

  <div class="form-group">
    <label for="full-name">Full Name *</label>
    <input type="text" id="full-name" name="fullName" minlength="2" required />
  </div>

  <!-- BUG: Overly restrictive regex pattern that rejects standard 5-digit US zips -->
  <div class="form-group">
    <label for="zipcode">Postal Code *</label>
    <input 
      type="text" 
      id="zipcode" 
      name="zipcode" 
      pattern="^[0-9]{3}$" 
      placeholder="12345"
      required 
    />
    <small>Requires exactly 3 digits instead of 5</small>
  </div>

  <!-- BUG: Quantity allows negative numbers! Missing min="1" -->
  <div class="form-group">
    <label for="quantity">Item Quantity</label>
    <input 
      type="number" 
      id="quantity" 
      name="quantity" 
      max="10" 
      value="1" 
    />
    <small>No minimum set, allows -5 items!</small>
  </div>

  <button type="submit">Place Order</button>
</form>`,
  },
];
