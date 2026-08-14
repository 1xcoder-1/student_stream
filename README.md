# Student Stream 🎓

Student Stream is a completely free, open-source expense tracking application built specifically for students. It helps you manage your monthly budget, track recurring expenses (like hostel rent, internet, and food), and uses AI to give you smart coaching on your spending habits.

## 🌟 Features

- **Expense Tracking:** Easily add and manage all your student expenses in one place.
- **Smart AI Coaching:** Uses Google Gemini AI to analyze your spending and give you personalized tips to save money.
- **AI Auto-Fill:** Quickly add expenses with the help of AI that guesses the category and details.
- **Email Reminders:** Get automatic email notifications before an expense is due so you never miss a payment.
- **PDF Export:** Download clean, print-ready reports of your spending for your records.
- **Dark/Light Mode:** A beautiful, responsive design that works perfectly on both your phone and laptop.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Authentication)
- **AI Integration:** Google Gemini API
- **Charts:** Recharts
- **Emails:** Nodemailer (via standard SMTP)

## 🚀 Getting Started

If you want to run this project on your own computer, follow these simple steps:

### 1. Install Dependencies
Make sure you have Node.js installed. Open your terminal and run:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a file named `.env` in the root folder of the project. You will need to add the following information:

```env
# Supabase (For Database & Authentication)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini (For AI Features)
GEMINI_API_KEY=your-gemini-api-key

# Email Reminders (Using Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@studentstream.com

# URL for the app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the app!

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
