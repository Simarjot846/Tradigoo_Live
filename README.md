# Tradigoo - Retailer-First Secure B2B Transaction Platform

A complete hackathon MVP prototype for a secure B2B trading platform targeted at small and medium Indian retailers.

## 🎯 Core Features

### 1. AI-Powered Product Recommendations
- **"What Should I Sell Today?"** - Smart recommendations based on:
  - Demand levels (High/Medium/Low)
  - Regional trends
  - Seasonal factors
  - Expected profit margins
  - Trusted supplier availability

### 2. Secure Escrow Payment System
- Payment held safely until delivery confirmation
- OTP-based delivery verification
- 24-hour inspection window
- Quality confirmation before payment release

### 3. Trust Score System
- Transparent ratings for all users
- Based on successful transactions and dispute history
- Visible before every transaction

### 4. Complete Order Lifecycle
1. **Payment in Escrow** - Funds secured
2. **Shipped** - Order on the way
3. **Delivered** - OTP verification
4. **Inspection** - 24-hour quality check
5. **Completed** - Payment released

### 5. Dispute Resolution
- Evidence-based system
- Photo/video upload support
- Fair resolution process

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router) + TypeScript
- **UI Components**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (mock data for demo)
- **Authentication**: Supabase Auth (mock for demo)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📦 Installation

1. **Clone and install dependencies:**
```bash
cd tradigoo
npm install
```

2. **Set up environment variables:**
```bash
# .env.local is already created with mock mode enabled
# For production, add your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
```
http://localhost:3000
```

## 🎮 Demo Accounts

The app comes with pre-configured demo accounts:

**Retailer Account:**
- Email: `retailer@demo.com`
- Password: any password
- Role: Retailer (Buyer)

**Wholesaler Account:**
- Email: `wholesaler@demo.com`
- Password: any password
- Role: Wholesaler (Seller)

## 🎯 Demo Flow (Recommended for Hackathon Presentation)

1. **Landing Page** → Click "Get Started"
2. **Login** → Use `retailer@demo.com`
3. **Dashboard** → See AI recommendations with demand levels and margins
4. **Click a Product** → View detailed product information
5. **Place Order** → Enter quantity and proceed
6. **Confirm Order** → Review escrow protection details
7. **Pay Securely** → Payment goes into escrow
8. **Order Tracking** → See order status timeline
9. **Simulate Shipment** → Click demo button
10. **Simulate Delivery** → Enter OTP (shown on screen)
11. **Inspection Window** → Choose to confirm quality or report issue
12. **Complete** → Payment released to supplier

## 🌟 Key Differentiators

### For Retailers:
- ✅ No more guessing what to stock
- ✅ AI tells you what's in demand
- ✅ See expected margins before buying
- ✅ 100% payment protection
- ✅ Quality guarantee with inspection window

### For Wholesalers:
- ✅ Access to verified retailers
- ✅ Secure payment guarantee
- ✅ Build trust score for more business
- ✅ Fair dispute resolution

## 📱 Mobile-First Design

- Fully responsive across all devices
- Touch-friendly interface
- Hindi/English language toggle
- Simple, clear navigation for non-tech users

## 🔒 Security Features

1. **Escrow System**: Payment held until confirmation
2. **OTP Verification**: Secure delivery confirmation
3. **Inspection Window**: 24 hours to check quality
4. **Evidence Upload**: Photo/video proof for disputes
5. **Trust Scores**: Transparent user ratings

## 🎨 Design Philosophy

- **Clean & Professional**: Trust-building blue/green color scheme
- **Simple Navigation**: Easy for small retailers to use
- **Clear CTAs**: Big buttons, obvious next steps
- **Visual Feedback**: Progress bars, status badges, animations
- **Accessible**: WCAG compliant components

## 📊 Mock Data

The app includes 20 pre-loaded products across categories:
- Grains (Rice, Wheat, etc.)
- Pulses (Dal varieties)
- Oils (Cooking oils)
- Spices (Turmeric, Chilli, etc.)
- Sweeteners (Sugar, Jaggery)
- Beverages (Tea, Coffee)

## 🚀 Deployment

### Deploy to Vercel (Recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables for Production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🗄️ Supabase Setup (Optional for Production)

If you want to use real Supabase instead of mock data:

1. Create a Supabase project at https://supabase.com
2. Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('retailer', 'wholesaler')),
  name TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  location TEXT,
  trust_score INTEGER DEFAULT 500,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL NOT NULL,
  demand_score INTEGER,
  demand_level TEXT CHECK (demand_level IN ('High', 'Medium', 'Low')),
  expected_margin DECIMAL,
  supplier_count INTEGER,
  image_url TEXT,
  description TEXT,
  unit TEXT,
  min_order_quantity INTEGER,
  region_boost INTEGER,
  season_factor INTEGER,
  recommendation_reason TEXT
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  total_amount DECIMAL NOT NULL,
  status TEXT NOT NULL,
  otp TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  inspection_deadline TIMESTAMP,
  dispute_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

3. Update `.env.local` with your Supabase credentials
4. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`

## 🎯 Hackathon Pitch Points

1. **Problem**: Retailers don't know what to sell, fear fraud, lose money on bad deals
2. **Solution**: AI guidance + Escrow protection + Trust scores
3. **Market**: 12M+ small retailers in India
4. **Traction**: Demo shows complete flow working
5. **Tech**: Modern, scalable stack (Next.js + Supabase)
6. **Differentiation**: Only platform combining AI recommendations with escrow
7. **Business Model**: Transaction fees (2-3%) + Premium features

## 📝 Future Enhancements

- [ ] Real-time chat between buyers and sellers
- [ ] Bulk order discounts
- [ ] Credit/BNPL integration
- [ ] Inventory management for retailers
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Regional language support (Hindi, Tamil, etc.)
- [ ] Integration with logistics partners
- [ ] Invoice generation
- [ ] GST compliance features

## 🤝 Contributing

This is a hackathon MVP. For production use, consider:
- Real authentication system
- Payment gateway integration (Razorpay/Stripe)
- File upload to cloud storage
- Email/SMS notifications
- Advanced AI/ML for recommendations
- Load testing and optimization

## 📄 License

MIT License - Feel free to use for your hackathon or startup!

## 🙏 Acknowledgments

Built with ❤️ for Indian retailers who deserve better tools to grow their business.

---

**Made for Hackathons | Ready to Demo | Production-Ready Architecture**
