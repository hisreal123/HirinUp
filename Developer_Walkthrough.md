# FoloUp - Developer Walkthrough & Project Estimation

## Executive Summary

FoloUp is an AI-powered voice interview platform that enables companies to conduct automated hiring interviews with candidates. The platform uses AI to generate interview questions, conduct voice-based interviews, and provide detailed analytics on candidate performance.

**Current Tech Stack:** Next.js 16, React 18, TypeScript, Supabase, Clerk, Retell AI, OpenAI

**Proposed Rewrite:** React (Frontend) + Node.js (Backend) + AI Integration

---

## 📋 Table of Contents

1. [Core Features](#core-features)
2. [Services & Integrations](#services--integrations)
3. [Architecture Overview](#architecture-overview)
4. [Technical Implementation Details](#technical-implementation-details)
5. [Project Estimation](#project-estimation)
6. [Pricing Strategy](#pricing-strategy)

---

## 🎯 Core Features

### 1. **Interview Management System**

#### Interview Creation
- **AI-Powered Question Generation**: Automatically generates interview questions from job descriptions
  - Accepts text input or PDF upload (job descriptions)
  - Uses OpenAI GPT-4o to generate contextual questions
  - Configurable number of questions
  - Generates interview descriptions automatically
- **Interview Configuration**:
  - Custom interview name, description, and objective
  - Interviewer selection (AI voice personalities)
  - Custom branding (logo, theme colors)
  - Anonymous vs. named interviews
  - Active/inactive status management
  - Archive functionality

#### Interview Sharing
- **Unique Interview Links**: Auto-generated unique URLs for each interview
- **Readable Slugs**: SEO-friendly URLs (e.g., `company-name-interview-title`)
- **One-Click Sharing**: Easy link distribution to candidates

### 2. **AI Voice Interview System**

#### Real-Time Voice Interviews
- **Web-Based Voice Calls**: Browser-based voice interviews using Retell AI SDK
- **AI Interviewer Personalities**: Multiple interviewer options with different voices
  - Customizable empathy, exploration, rapport, and speed parameters
  - Different voice profiles (e.g., Lisa, Bob)
- **Dynamic Question Flow**: AI adapts questions based on candidate responses
- **Call Management**:
  - Call registration and tracking
  - Real-time call status monitoring
  - Call recording and transcript storage
  - Tab switch detection and prevention

#### Interviewer Management
- **Custom Interviewer Creation**: Create AI interviewers with:
  - Name, description, and avatar
  - Voice selection
  - Personality traits (empathy, exploration, rapport, speed)
  - Custom audio files
- **Interviewer Library**: Pre-built interviewer templates

### 3. **Analytics & Insights**

#### Response Analysis
- **Overall Scoring**: 0-100 score based on multiple factors:
  - Communication skills (0-10 scale)
  - Time taken to answer
  - Confidence level
  - Clarity of responses
  - Attitude and engagement
  - Relevance of answers
  - Depth of knowledge
  - Problem-solving ability
  - Examples and evidence provided
  - Listening skills
  - Consistency
  - Adaptability

#### Detailed Feedback
- **Question-by-Question Analysis**: Summary for each interview question
- **Communication Analysis**: Detailed breakdown of communication skills
  - Supporting quotes from transcript
  - Strengths and improvement areas
  - Communication score (0-10)
- **Soft Skills Summary**: 10-15 word summary covering:
  - Confidence
  - Leadership
  - Adaptability
  - Critical thinking
  - Decision making

#### Insights Generation
- **Aggregate Insights**: AI-generated insights from multiple interview responses
- **Trend Analysis**: Patterns across candidate responses
- **Quote Extraction**: Key quotes from interviews

### 4. **Dashboard & Management**

#### Interview Dashboard
- **Interview Overview**: List of all interviews with:
  - Interview name and description
  - Response count
  - Question count
  - Status (active/inactive/archived)
  - Share functionality
- **Interview Details Page**:
  - Full interview configuration
  - Response list with analytics
  - Data table with filtering and sorting
  - Individual response analysis
  - Summary information
  - Edit and archive capabilities

#### Response Management
- **Response Tracking**: 
  - Candidate name and email
  - Call duration
  - Analysis status
  - View status
  - Tab switch count
- **Response Analytics**: Detailed analytics per response
- **Bulk Operations**: Archive, delete, export

### 5. **User & Organization Management**

#### Authentication & Authorization
- **Multi-tenant Support**: Organization-based access control
- **User Management**: 
  - User profiles linked to organizations
  - Role-based access (implied through Clerk)
- **Organization Settings**:
  - Plan management (free, pro, free_trial_over)
  - Response limits
  - Organization branding

#### Subscription Management
- **Free Plan**: 
  - 10 responses limit
  - Basic features
- **Pro Plan**:
  - Pay-per-response model
  - All features
  - Priority support
- **Plan Enforcement**: Automatic deactivation when limits exceeded

### 6. **Additional Features**

#### File Upload & Processing
- **PDF Parsing**: Extract text from job description PDFs
- **File Validation**: File type and size validation

#### Feedback System
- **Candidate Feedback**: Post-interview feedback collection
  - Satisfaction rating
  - Text feedback
  - Email collection

#### UI/UX Features
- **Responsive Design**: Mobile and desktop support
- **Dark/Light Theme**: Theme switching capability
- **Loading States**: Comprehensive loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Modal Dialogs**: Confirmation and information dialogs

---

## 🔌 Services & Integrations

### 1. **Authentication: Clerk**
- **Purpose**: User authentication and organization management
- **Features Used**:
  - Email/password authentication
  - Organization creation and management
  - User session management
  - Protected routes
- **Cost**: Free tier available, paid plans start at $25/month
- **API Integration**: `@clerk/nextjs`, `@clerk/clerk-js`

### 2. **Database: Supabase (PostgreSQL)**
- **Purpose**: Primary data storage
- **Tables**:
  - `organization`: Company/team data, plans, limits
  - `user`: User profiles and organization links
  - `interviewer`: AI interviewer configurations
  - `interview`: Interview configurations and metadata
  - `response`: Candidate interview responses and analytics
  - `feedback`: Post-interview feedback
- **Features Used**:
  - PostgreSQL database
  - Real-time subscriptions (potential)
  - Row-level security
- **Cost**: Free tier (500MB database, 2GB bandwidth), paid from $25/month
- **API Integration**: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`

### 3. **Voice AI: Retell AI**
- **Purpose**: Voice call management and AI agent orchestration
- **Features Used**:
  - Web call creation and management
  - AI agent configuration
  - LLM integration (GPT-4o)
  - Call recording and transcription
  - Webhook events (call_started, call_ended, call_analyzed)
  - Voice selection (11labs voices)
- **Cost**: Pay-per-minute pricing, typically $0.05-0.15/minute
- **API Integration**: `retell-sdk`, `retell-client-js-sdk`

### 4. **AI/LLM: OpenAI**
- **Purpose**: Question generation, response analysis, insights
- **Models Used**: GPT-4o
- **Use Cases**:
  - Interview question generation from job descriptions
  - Response analytics and scoring
  - Communication skills analysis
  - Insights generation from multiple responses
  - Soft skills assessment
- **Cost**: GPT-4o pricing ~$0.005/1K input tokens, $0.015/1K output tokens
- **API Integration**: `openai` (v4.6.0)

### 5. **PDF Processing: LangChain**
- **Purpose**: Extract text from job description PDFs
- **Features Used**: PDFLoader for document parsing
- **Cost**: Open source library
- **API Integration**: `langchain`

### 6. **Hosting & Deployment**
- **Current**: Vercel (recommended)
- **Alternative**: Any Node.js hosting (AWS, GCP, Azure, DigitalOcean)
- **Cost**: Vercel free tier, paid from $20/month

---

## 🏗️ Architecture Overview

### Current Architecture (Next.js)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard  │  │  Interviews  │  │   Call UI    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │           API Routes (Next.js API)                │   │
│  │  - create-interview                              │   │
│  │  - generate-interview-questions                  │   │
│  │  - register-call                                 │   │
│  │  - analyze-communication                        │   │
│  │  - generate-insights                             │   │
│  │  - response-webhook                              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   Supabase   │  │  Retell AI   │  │   OpenAI     │
│  (Database)  │  │  (Voice AI)  │  │   (LLM)      │
└──────────────┘  └──────────────┘  └──────────────┘
        │
┌───────▼──────┐
│    Clerk     │
│  (Auth)      │
└──────────────┘
```

### Proposed Architecture (React + Node.js)

```
┌─────────────────────────────────────────────────────────┐
│              React Frontend (SPA)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard  │  │  Interviews  │  │   Call UI    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  State Management: React Query / Redux / Zustand        │
│  UI Framework: React + Tailwind CSS / Material-UI       │
└─────────────────────────────────────────────────────────┘
                          │
                    HTTP/REST API
                          │
┌─────────────────────────────────────────────────────────┐
│           Node.js Backend (Express/Fastify)            │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Endpoints                       │   │
│  │  POST   /api/interviews                          │   │
│  │  POST   /api/interviews/:id/questions            │   │
│  │  POST   /api/calls/register                      │   │
│  │  POST   /api/responses/:id/analyze               │   │
│  │  POST   /api/responses/:id/communication          │   │
│  │  POST   /api/insights                            │   │
│  │  POST   /api/webhooks/retell                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Service Layer                        │   │
│  │  - InterviewService                               │   │
│  │  - ResponseService                                │   │
│  │  - AnalyticsService                               │   │
│  │  - InterviewerService                             │   │
│  │  - AIService (OpenAI integration)                 │   │
│  │  - RetellService                                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   Supabase   │  │  Retell AI   │  │   OpenAI     │
│  (Database)  │  │  (Voice AI)  │  │   (LLM)      │
└──────────────┘  └──────────────┘  └──────────────┘
        │
┌───────▼──────┐
│    Clerk     │
│  (Auth)      │
└──────────────┘
```

---

## 🔧 Technical Implementation Details

### Frontend (React)

#### Key Technologies
- **React 18+**: Core framework
- **TypeScript**: Type safety
- **React Router**: Navigation
- **React Query / TanStack Query**: Server state management
- **Zustand / Redux**: Client state management (optional)
- **Tailwind CSS**: Styling
- **shadcn/ui or Material-UI**: Component library
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Axios**: HTTP client

#### Key Components
- Dashboard layout with sidebar navigation
- Interview list and cards
- Interview creation modal with form
- Interview detail page with analytics
- Call interface with Retell Web SDK
- Response data tables
- Analytics visualization components
- Interviewer management UI

### Backend (Node.js)

#### Key Technologies
- **Node.js 18+**: Runtime
- **Express.js or Fastify**: Web framework
- **TypeScript**: Type safety
- **Prisma or TypeORM**: Database ORM (optional, can use Supabase client directly)
- **Winston or Pino**: Logging
- **Joi or Zod**: Request validation
- **Express Rate Limit**: Rate limiting
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

#### API Endpoints

```
Authentication:
  - Middleware: Clerk authentication verification

Interviews:
  GET    /api/interviews              - List all interviews
  GET    /api/interviews/:id          - Get interview details
  POST   /api/interviews              - Create interview
  PUT    /api/interviews/:id          - Update interview
  DELETE /api/interviews/:id          - Delete interview
  POST   /api/interviews/:id/questions - Generate questions

Interviewers:
  GET    /api/interviewers            - List interviewers
  GET    /api/interviewers/:id        - Get interviewer
  POST   /api/interviewers            - Create interviewer

Calls:
  POST   /api/calls/register          - Register new call
  GET    /api/calls/:id               - Get call details

Responses:
  GET    /api/responses               - List responses
  GET    /api/responses/:id           - Get response details
  POST   /api/responses/:id/analyze  - Analyze response
  POST   /api/responses/:id/communication - Analyze communication

Analytics:
  POST   /api/insights                - Generate insights

Webhooks:
  POST   /api/webhooks/retell         - Retell webhook handler

Files:
  POST   /api/files/upload            - Upload PDF
  POST   /api/files/parse-pdf         - Parse PDF content
```

#### Service Layer Structure

```typescript
// Example service structure
class InterviewService {
  async createInterview(data: CreateInterviewDto): Promise<Interview>
  async getInterviewById(id: string): Promise<Interview>
  async updateInterview(id: string, data: UpdateInterviewDto): Promise<Interview>
  async deleteInterview(id: string): Promise<void>
  async generateQuestions(interviewId: string, context: string): Promise<Question[]>
}

class AIService {
  async generateQuestions(prompt: string): Promise<Question[]>
  async analyzeResponse(transcript: string, questions: Question[]): Promise<Analytics>
  async analyzeCommunication(transcript: string): Promise<CommunicationAnalysis>
  async generateInsights(summaries: string[]): Promise<Insight[]>
}

class RetellService {
  async registerCall(agentId: string, dynamicData: any): Promise<CallResponse>
  async getCallDetails(callId: string): Promise<CallDetails>
  async handleWebhook(event: string, data: any): Promise<void>
}
```

### Database Schema (Supabase)

#### Core Tables
- **organizations**: Company data, subscription plans
- **users**: User profiles linked to organizations
- **interviewers**: AI interviewer configurations
- **interviews**: Interview configurations
- **responses**: Interview responses and analytics
- **feedback**: Candidate feedback

#### Key Relationships
- Users → Organizations (many-to-one)
- Interviews → Organizations (many-to-one)
- Interviews → Users (many-to-one)
- Interviews → Interviewers (many-to-one)
- Responses → Interviews (many-to-one)

---

## 💰 Project Estimation

### Development Time Breakdown

#### Phase 1: Setup & Core Infrastructure (2-3 weeks)
- Project setup (React + Node.js)
- Database schema migration
- Authentication integration (Clerk)
- Basic API structure
- **Estimated Hours**: 80-120 hours

#### Phase 2: Interview Management (3-4 weeks)
- Interview CRUD operations
- Interview creation UI
- Interview list and detail pages
- File upload and PDF parsing
- Question generation API
- **Estimated Hours**: 120-160 hours

#### Phase 3: Voice Interview System (4-5 weeks)
- Retell AI integration
- Call registration and management
- Web-based call interface
- Interviewer management
- Webhook handling
- Real-time call status
- **Estimated Hours**: 160-200 hours

#### Phase 4: Analytics & Insights (3-4 weeks)
- Response analytics API
- Communication analysis
- Insights generation
- Analytics visualization
- Data tables and filtering
- **Estimated Hours**: 120-160 hours

#### Phase 5: Dashboard & UI Polish (2-3 weeks)
- Dashboard layout
- Navigation and routing
- UI component library integration
- Responsive design
- Loading states and error handling
- **Estimated Hours**: 80-120 hours

#### Phase 6: Testing & Deployment (2-3 weeks)
- Unit testing
- Integration testing
- E2E testing
- Performance optimization
- Deployment setup
- Documentation
- **Estimated Hours**: 80-120 hours

### Total Development Time

**Conservative Estimate**: 640-880 hours (16-22 weeks / 4-5.5 months)
**Realistic Estimate**: 720-960 hours (18-24 weeks / 4.5-6 months)
**With Buffer**: 800-1,100 hours (20-28 weeks / 5-7 months)

### Team Composition Options

#### Option 1: Solo Developer
- **Timeline**: 5-7 months
- **Cost**: Developer hourly rate × hours

#### Option 2: Small Team (2-3 developers)
- **Frontend Developer**: React specialist
- **Backend Developer**: Node.js specialist
- **Timeline**: 3-4 months
- **Cost**: 2-3 × developer hourly rate × hours

#### Option 3: Full Team (4-5 developers)
- **Frontend Developer**: React/UI
- **Backend Developer**: Node.js/API
- **Full-stack Developer**: Integration
- **DevOps Engineer**: Deployment
- **QA Engineer**: Testing
- **Timeline**: 2-3 months
- **Cost**: 4-5 × developer hourly rate × hours

---

## 💵 Pricing Strategy

### Development Cost Estimation

#### Hourly Rate Assumptions
- **Junior Developer**: $30-50/hour
- **Mid-level Developer**: $50-80/hour
- **Senior Developer**: $80-150/hour
- **Full-stack Developer**: $60-120/hour

#### Cost Scenarios

**Scenario 1: Solo Senior Developer**
- Hours: 800-1,100
- Rate: $100/hour
- **Total Cost**: $80,000 - $110,000

**Scenario 2: Small Team (2 Mid-level Developers)**
- Hours: 640-880 (split between 2)
- Rate: $65/hour each
- **Total Cost**: $41,600 - $57,200

**Scenario 3: Full Team (4 Developers)**
- Hours: 640-880 (split between 4)
- Average Rate: $75/hour
- **Total Cost**: $48,000 - $66,000

### Additional Costs

#### Third-party Services (Monthly)
- **Clerk**: $0-25/month (free tier available)
- **Supabase**: $0-25/month (free tier available)
- **Retell AI**: Pay-per-use (~$0.10/minute)
- **OpenAI**: Pay-per-use (~$0.01-0.05 per interview analysis)
- **Hosting (Vercel/AWS)**: $20-100/month
- **Domain & SSL**: $10-20/year
- **Total Monthly**: $30-150/month (excluding usage-based)

#### One-time Costs
- **Design/UI**: $2,000-5,000 (if hiring designer)
- **Project Management**: $1,000-3,000
- **QA/Testing**: $3,000-8,000 (if separate QA)
- **Documentation**: $1,000-2,000

### Recommended Pricing Structure

#### For Client/Client Project
**Fixed Price Option:**
- **Basic Version**: $60,000 - $80,000
- **Full Featured**: $80,000 - $120,000
- **Enterprise (with custom features)**: $120,000 - $180,000

**Time & Materials:**
- **Hourly Rate**: $80-120/hour
- **Estimated Total**: $64,000 - $132,000

#### For Product Development (SaaS)
**MVP Development:**
- **Phase 1-3 (Core Features)**: $40,000 - $60,000
- **Phase 4-5 (Analytics & Polish)**: $20,000 - $40,000
- **Phase 6 (Testing & Launch)**: $10,000 - $20,000
- **Total MVP**: $70,000 - $120,000

**Post-MVP Enhancements:**
- **Monthly Maintenance**: $2,000 - $5,000/month
- **Feature Additions**: $5,000 - $15,000 per feature
- **Scaling & Optimization**: $10,000 - $30,000

### Market Comparison

Similar platforms in the market:
- **HireVue**: Enterprise pricing (custom quotes, typically $50K+)
- **Spark Hire**: $149-499/month per user
- **Willo**: Custom pricing
- **MyInterview**: $99-299/month

**FoloUp's Competitive Position:**
- Open-source alternative
- More affordable pricing model
- Customizable AI interviewers
- Modern tech stack

---

## 📊 Complexity Assessment

### High Complexity Areas
1. **Voice AI Integration** (Retell AI)
   - Real-time call management
   - Webhook handling
   - Audio streaming
   - Browser compatibility

2. **AI Analysis Pipeline**
   - Multiple OpenAI API calls
   - Complex prompt engineering
   - Response parsing and validation
   - Error handling and retries

3. **Real-time Features**
   - Call status updates
   - Live transcript updates
   - Tab switch detection

### Medium Complexity Areas
1. **Interview Management**
   - CRUD operations
   - File upload and processing
   - Question generation workflow

2. **Analytics Dashboard**
   - Data visualization
   - Complex filtering and sorting
   - Export functionality

### Low Complexity Areas
1. **Authentication** (Clerk handles most)
2. **Basic CRUD operations**
3. **UI Components** (using component library)

---

## 🚀 Recommended Approach

### For Rewrite Project

1. **Start with MVP** (Phases 1-3)
   - Core interview creation
   - Basic voice interviews
   - Simple analytics
   - **Timeline**: 2-3 months
   - **Cost**: $40,000 - $60,000

2. **Iterate and Enhance** (Phases 4-6)
   - Advanced analytics
   - UI polish
   - Testing and optimization
   - **Timeline**: 2-3 months
   - **Cost**: $30,000 - $50,000

3. **Scale and Optimize**
   - Performance improvements
   - Additional features
   - Enterprise features
   - **Ongoing**: $5,000 - $15,000/month

### Technology Recommendations

**Frontend:**
- React 18+ with TypeScript
- Vite or Create React App
- React Query for server state
- Tailwind CSS + shadcn/ui
- React Router v6

**Backend:**
- Node.js 18+ with TypeScript
- Express.js or Fastify
- Prisma (optional, for type-safe DB access)
- JWT authentication (Clerk integration)
- RESTful API design

**DevOps:**
- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Environment management
- Monitoring and logging

---

## 📝 Conclusion

FoloUp is a sophisticated AI-powered interview platform with multiple complex integrations. A complete rewrite in React + Node.js would require:

- **Time**: 5-7 months (solo) or 2-3 months (team)
- **Cost**: $60,000 - $120,000 (depending on team and scope)
- **Complexity**: High (due to AI integrations and real-time features)

The platform offers significant value in the hiring/recruitment space and has proven market demand (multiple companies built on top of it).

**Recommended Pricing for Client Project**: $80,000 - $120,000 for full-featured version.

---

## 📚 Additional Resources

- **Current Codebase**: [GitHub - FoloUp/FoloUp](https://github.com/FoloUp/FoloUp)
- **Clerk Documentation**: https://clerk.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Retell AI Documentation**: https://docs.retellai.com
- **OpenAI API Documentation**: https://platform.openai.com/docs

---

*Document created: January 2025*
*Based on analysis of FoloUp codebase (Next.js version)*

